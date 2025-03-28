import { useQuery } from '@tanstack/react-query';
import { getAllStudents, getFacultyProfile, getStudent, getStudentStatuses, getStudentProposals, getProposal, getReviewersService, getPanelistsService } from './api.js';

export const useGetFacultyProfile = () => {
  return useQuery({
    queryKey: ['facultyProfile'],
    queryFn: getFacultyProfile,
    staleTime: Infinity,
  });
};

/* ********** STUDENT MANAGEMENT ********** */

export const useGetAllStudents = () => {
  return useQuery({
    queryKey: ['allStudents'],
    queryFn: getAllStudents,
    staleTime: Infinity,
  });
};


export const useGetStudent = (studentId: string) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId),
    staleTime: Infinity,
  });
};

export const useGetStudentStatuses = (studentId: string) => {
  return useQuery({
    queryKey: ['studentStatuses', studentId],
    queryFn: () => getStudentStatuses(studentId),
    staleTime: Infinity,
  });
};

/* ********** END OF STUDENT MANAGEMENT ********** */

/* ********** PROPOSAL MANAGEMENT ********** */

export const useGetStudentProposals = (studentId: string) => {
  return useQuery({
    queryKey: ['studentProposals', studentId],
    queryFn: () => getStudentProposals(studentId),
    staleTime: Infinity,
  });
};

export const useGetProposal = (studentId: string, proposalId: string) => {
  return useQuery({
    queryKey: ['proposal', studentId, proposalId],
    queryFn: () => getProposal(studentId, proposalId),
    staleTime: Infinity,
  });
};


  /* ********** END OF PROPOSAL MANAGEMENT ********** */  

/* ********** REVIEWER MANAGEMENT ********** */

export const useGetReviewers = () => {
  return useQuery({
    queryKey: ['reviewers'],
    queryFn: getReviewersService,
    staleTime: Infinity,
  });
};

/* ********** END OF REVIEWER MANAGEMENT ********** */

/* ********** PANELIST MANAGEMENT ********** */

export const useGetPanelists = () => {
  return useQuery({
    queryKey: ['panelists'],
    queryFn: getPanelistsService,
    staleTime: Infinity,
  });
};

/* ********** END OF PANELIST MANAGEMENT ********** */