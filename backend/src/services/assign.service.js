import * as assignRepository from '../repositories/assign.repository.js';
import * as projectRepository from '../repositories/project.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import projectService from './project.service.js';
import { AppError } from '../utils/AppError.js';

class AssignService {
  mapMemberOption(member) {
    return {
      memberId: member.id,
      name: member.name,
      email: member.email,
    };
  }

  mapAssignedMember(member) {
    return {
      memberId: member.id,
      name: member.name,
      email: member.email,
      assignedAt: member.assigned_at,
    };
  }

  listAvailableMembers = async (projectId, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await projectService.assertCanManageProject(project, user);

    const [allMembers, assignedMembers] = await Promise.all([
      userRepository.findActiveMembers(),
      assignRepository.getMembers(projectId),
    ]);

    const assignedMemberIds = new Set(assignedMembers.map((member) => member.id));
    const availableMembers = allMembers
      .filter((member) => !assignedMemberIds.has(member.id))
      .map((member) => this.mapMemberOption(member));

    return {
      id: Number(projectId),
      projectId: Number(projectId),
      availableMembers,
    };
  };

  listAssignments = async (projectId, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await projectService.assertCanManageProject(project, user);

    const [managers, members] = await Promise.all([
      projectRepository.getManagers(projectId),
      assignRepository.getMembers(projectId),
    ]);

    return {
      id: Number(projectId),
      projectId: Number(projectId),
      managers: managers.map((manager) => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
      })),
      members: members.map((member) => this.mapAssignedMember(member)),
    };
  };

  assignMember = async (projectId, memberId, currentUser) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await projectService.assertCanManageProject(project, currentUser);

    const memberUser = await userRepository.findActiveById(memberId);

    if (!memberUser) {
      throw new AppError(404, 'Member not found', 'NOT_FOUND');
    }

    if (memberUser.role !== 'member') {
      throw new AppError(400, 'User must have the member role', 'INVALID_ROLE');
    }

    await assignRepository.assignMember({
      projectId,
      userId: memberId,
      assignedBy: currentUser.userId,
    });

    const members = await assignRepository.getMembers(projectId);

    return {
      id: Number(projectId),
      projectId: Number(projectId),
      memberId: Number(memberId),
      members: members.map((member) => this.mapAssignedMember(member)),
    };
  };

  removeMember = async (projectId, memberId, currentUser) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await projectService.assertCanManageProject(project, currentUser);

    const removed = await assignRepository.removeMember({
      projectId,
      userId: memberId,
    });

    if (!removed) {
      throw new AppError(404, 'Member assignment not found', 'NOT_FOUND');
    }

    return {
      id: Number(projectId),
      projectId: Number(projectId),
      memberId: Number(memberId),
    };
  };
}

export { AssignService };
export default new AssignService();
