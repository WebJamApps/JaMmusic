import type { Ipic } from './Data.provider';
import socketClusterMessages from './socketClusterMessages';

const getPics = (setPics: (_arg0: Ipic[] | null) => void): boolean => socketClusterMessages.initialMessage(setPics, 'allBooks');

export default { getPics };
