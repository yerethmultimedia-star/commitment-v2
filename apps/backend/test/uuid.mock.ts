import * as crypto from 'crypto';

export const v4 = () => crypto.randomUUID();
export default v4;
