import commonUtils from 'src/lib/commonUtils';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Isong } from 'src/providers/Data.provider';

const createSong = async (
  getSongs: () => Promise<Isong[]>,
  setShowDialog: (arg0: boolean) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  song: Isong,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  auth: Iauth,
) => {
  try {
    // const { token } = auth;
    // axios post here to create song
    setShowDialog(false);
    await commonUtils.delay(2);
    await getSongs();
  } catch (err) { console.log((err as Error).message); }
};

export default { createSong };
