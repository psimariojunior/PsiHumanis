import { prisma } from "./prisma"

export interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

export async function registerPatient(room: string, name: string, status: "waiting" | "approved" = "approved"): Promise<WaitingPatient> {
  const entry = await prisma.waitingRoomEntry.create({
    data: { room, name, status },
  })
  return {
    id: entry.id,
    room: entry.room,
    name: entry.name,
    status: entry.status as "waiting" | "approved" | "rejected",
    createdAt: entry.createdAt.getTime(),
  }
}

export async function approvePatient(id: string): Promise<boolean> {
  try {
    await prisma.waitingRoomEntry.update({
      where: { id },
      data: { status: "approved" },
    })
    return true
  } catch {
    return false
  }
}

export async function rejectPatient(id: string): Promise<boolean> {
  try {
    await prisma.waitingRoomEntry.update({
      where: { id },
      data: { status: "rejected" },
    })
    return true
  } catch {
    return false
  }
}

export async function removePatient(id: string): Promise<void> {
  try {
    await prisma.waitingRoomEntry.delete({ where: { id } })
  } catch {}
}

export async function getPatient(id: string): Promise<WaitingPatient | null> {
  const entry = await prisma.waitingRoomEntry.findUnique({ where: { id } })
  if (!entry) return null
  return {
    id: entry.id,
    room: entry.room,
    name: entry.name,
    status: entry.status as "waiting" | "approved" | "rejected",
    createdAt: entry.createdAt.getTime(),
  }
}

export async function getAllPatients(): Promise<WaitingPatient[]> {
  const entries = await prisma.waitingRoomEntry.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  })
  return entries.map((e) => ({
    id: e.id,
    room: e.room,
    name: e.name,
    status: e.status as "waiting" | "approved" | "rejected",
    createdAt: e.createdAt.getTime(),
  }))
}

export async function getPatientsByRoom(room: string): Promise<WaitingPatient[]> {
  const entries = await prisma.waitingRoomEntry.findMany({
    where: { room, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  })
  return entries.map((e) => ({
    id: e.id,
    room: e.room,
    name: e.name,
    status: e.status as "waiting" | "approved" | "rejected",
    createdAt: e.createdAt.getTime(),
  }))
}

export async function cleanupOldEntries(): Promise<void> {
  await prisma.waitingRoomEntry.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } },
  })
}
