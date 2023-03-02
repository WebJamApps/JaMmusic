import scc from 'socketcluster-client';
import commonUtils from 'src/lib/commonUtils';
import type { Iauth } from 'src/providers/Auth.provider';

const createPic = async (
  getPics: () => void,
  setShowDialog: (arg0: boolean) => void,
  image: Record<string, unknown>,
  auth: Iauth,
) => {
  try {
    image.type = 'JaMmusic-music';
    const { token } = auth;
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('newImage', { image, token });
    setShowDialog(false);
    await commonUtils.delay(2);
    getPics();
  } catch (err) { console.log((err as Error).message); }
};

export default { createPic };
