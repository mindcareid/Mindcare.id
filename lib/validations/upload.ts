import { z } from "zod";
import { UPLOAD_FOLDER_ENTITIES } from "../cloudinary/types/upload";

export const UploadSignatureSchema = z.object({
  entityType: z.enum(UPLOAD_FOLDER_ENTITIES),
});
