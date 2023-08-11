import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';
import type { Iauth } from 'src/providers/Auth.provider';

export const defaultPic = {
  url: '', comments: '', title: '', _id: undefined as string | undefined, type: 'JaMmusic-music',
};

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

const updatePic = async (
  editPic:typeof defaultPic,
  auth:Iauth,
  getPics:() => void,
  setEditPic:(arg0:typeof defaultPic)=>void,
  setShowTable:(arg0:boolean)=>void,
  setIsSubmitting:(arg0:boolean)=>void,
) => {
  try {
    setIsSubmitting(true);
    const { token } = auth;
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('editImage', { editPic, token });
    await commonUtils.delay(2);
    setIsSubmitting(false);
    setEditPic(defaultPic);
    getPics();
    setShowTable(false);
  } catch (err) { console.log((err as Error).message); }
};

async function deletePic(
  picId:string,
  auth:Iauth,
  getPics:() => void,
  setters:{ setEditPic:(arg0:typeof defaultPic)=>void,
    setShowTable:(arg0:boolean)=>void,
    setIsSubmitting:(arg0:boolean)=>void,
  },
) {
  try {
    setters.setIsSubmitting(true);
    const { token } = auth;
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('deleteImage', { data: picId, token });
    await commonUtils.delay(2);
    setters.setIsSubmitting(false);
    setters.setEditPic(defaultPic);
    getPics();
    setters.setShowTable(false);
  } catch (err) { console.log((err as Error).message); }
}

const makeShowHideCaption = (setPic: (arg0: typeof defaultPic) => void, pic: typeof defaultPic) => (evt: any) => {
  const { target: { checked } } = evt;
  const comments = checked ? 'showCaption' : '';
  setPic({ ...pic, comments });
};

export default {
  createPic, updatePic, deletePic, makeShowHideCaption,
};
