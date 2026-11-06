import React from 'react';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Isong } from 'src/providers/Data.provider';
import commonUtils from 'src/lib/utils';
import { customFetch } from 'src/lib/fetch.utils';

export const defaultSong = {
  url: '',
  title: '',
  category: 'original',
  year: new Date().getFullYear(),
  artist: 'Josh & Maria Sherman',
  composer: 'Josh & Maria Sherman',
  album: '',
  image: '',
};

const createSong = async (
  getSongs: () => Promise<Isong[]>,
  setShowDialog: (arg0: boolean) => void,
  song: Isong,
  setSong: (arg0: Isong) => void,
  auth: Iauth,
) => {
  try {
    const { token } = auth;
    const payload: Partial<Isong> = { ...song };
    if (!payload.url) delete payload.url;
    const res = await customFetch(`${process.env.BackendUrl}/song`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setShowDialog(false);
    setSong(defaultSong);
    await getSongs();
  } catch (err) { commonUtils.notify('Error creating song', (err as Error).message, 'danger'); }
};

const updateSong = async (
  getSongs: () => Promise<Isong[]>,
  setShowDialog: (arg0: boolean) => void,
  song: Isong,
  setSong: (arg0: Isong) => void,
  auth: Iauth,
) => {
  try {
    const { token } = auth;
    const payload: Partial<Isong> & { $unset?: Record<string, string> } = { ...song };
    if (!payload.url) {
      delete payload.url;
      payload.$unset = { url: '' };
    }
    const res = await customFetch(`${process.env.BackendUrl}/song/${song._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setShowDialog(false);
    setSong(defaultSong);
    await getSongs();
  } catch (err) { commonUtils.notify('Error creating song', (err as Error).message, 'danger'); }
};

const deleteSong = async (
  getSongs: () => Promise<Isong[]>,
  setShowDialog: (arg0: boolean) => void,
  song: Isong,
  auth: Iauth,
) => {
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
  try {
    const { token } = auth;
    const res = await customFetch(`${process.env.BackendUrl}/song/${song._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setShowDialog(false);
    await getSongs();
  } catch (err) { commonUtils.notify('Error deleting song', (err as Error).message, 'danger'); }
};

const checkDisabled = (song: Isong) => {
  if (song.title && song.artist && song.category) return false;
  return true;
};

function handleInputChange(
  evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } },
  setSong: React.Dispatch<React.SetStateAction<Isong>>,
  song: Isong,
  key: string,
): string {
  const { target: { value } } = evt;
  setSong({ ...song, [key]: value });
  return value;
}

export default {
  createSong, checkDisabled, handleInputChange, updateSong, deleteSong,
};
