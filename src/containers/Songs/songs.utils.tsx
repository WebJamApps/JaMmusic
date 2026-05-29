import React from 'react';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Isong } from 'src/providers/Data.provider';
import commonUtils from 'src/lib/utils';

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
    const res = await fetch(`${process.env.BackendUrl}/song`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(song),
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
    const res = await fetch(`${process.env.BackendUrl}/song/${song._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(song),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setShowDialog(false);
    setSong(defaultSong);
    await getSongs();
  } catch (err) { commonUtils.notify('Error creating song', (err as Error).message, 'danger'); }
};

const checkDisabled = (song: Isong) => {
  if (song.url && song.title && song.artist && song.year) return false;
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
  createSong, checkDisabled, handleInputChange, updateSong,
};
