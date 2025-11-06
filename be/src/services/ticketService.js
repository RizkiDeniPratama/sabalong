import { prisma } from '../config/prisma.js';

export const getAllTickets = async () => {
  return await prisma.ticket.findMany();
};

export const getTicketById = async (id) => {
  return await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
};

export const createTicket = async (data) => {
  return await prisma.ticket.create({ data });
};

export const updateTicket = async (id, data) => {
  return await prisma.ticket.update({ where: { id: parseInt(id) }, data });
};

export const deleteTicket = async (id) => {
  return await prisma.ticket.delete({ where: { id: parseInt(id) } });
};
