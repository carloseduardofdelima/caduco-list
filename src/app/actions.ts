"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Status } from "@prisma/client";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!password || password !== adminPassword) {
    return { success: false, error: "Senha incorreta." };
  }

  await createSession();
  return { success: true };
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/admin/login");
}

export async function createGame(data: {
  title: string;
  coverUrl?: string;
  status: Status;
  rating?: number | null;
  playedAt?: string | null;
  notes?: string | null;
  igdbId?: string | null;
  tags?: string[];
  isJapanOnly?: boolean;
  summary?: string | null;
  storyline?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseYear?: number | null;
  screenshots?: string[];
  videoUrl?: string | null;
}) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.create({
    data: {
      title: data.title,
      coverUrl: data.coverUrl || null,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      playedAt: data.playedAt ? new Date(data.playedAt) : null,
      notes: data.notes || null,
      igdbId: data.igdbId || null,
      platform: "PS2",
      tags: data.tags || [],
      isJapanOnly: data.isJapanOnly ?? false,
      summary: data.summary || null,
      storyline: data.storyline || null,
      developer: data.developer || null,
      publisher: data.publisher || null,
      releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
      screenshots: data.screenshots || [],
      videoUrl: data.videoUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return game;
}

export async function updateGame(
  id: string,
  data: {
    title: string;
    coverUrl?: string;
    status: Status;
    rating?: number | null;
    playedAt?: string | null;
    notes?: string | null;
    igdbId?: string | null;
    tags?: string[];
    isJapanOnly?: boolean;
    summary?: string | null;
    storyline?: string | null;
    developer?: string | null;
    publisher?: string | null;
    releaseYear?: number | null;
    screenshots?: string[];
    videoUrl?: string | null;
  }
) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.update({
    where: { id },
    data: {
      title: data.title,
      coverUrl: data.coverUrl || null,
      status: data.status,
      rating: data.rating ? Number(data.rating) : null,
      playedAt: data.playedAt ? new Date(data.playedAt) : null,
      notes: data.notes || null,
      igdbId: data.igdbId || null,
      tags: data.tags !== undefined ? data.tags : undefined,
      isJapanOnly: data.isJapanOnly !== undefined ? data.isJapanOnly : undefined,
      summary: data.summary !== undefined ? data.summary : undefined,
      storyline: data.storyline !== undefined ? data.storyline : undefined,
      developer: data.developer !== undefined ? data.developer : undefined,
      publisher: data.publisher !== undefined ? data.publisher : undefined,
      releaseYear: data.releaseYear !== undefined ? (data.releaseYear ? Number(data.releaseYear) : null) : undefined,
      screenshots: data.screenshots !== undefined ? data.screenshots : undefined,
      videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath(`/jogo/${id}`);
  revalidatePath("/admin");
  return game;
}

export async function updateGameStatus(id: string, status: Status) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  const game = await prisma.game.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath(`/jogo/${id}`);
  revalidatePath("/admin");
  return game;
}

export async function deleteGame(id: string) {
  const isAuth = await verifySession();
  if (!isAuth) {
    throw new Error("Não autorizado.");
  }

  await prisma.game.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
