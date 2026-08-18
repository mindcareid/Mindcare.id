/*
  Warnings:

  - A unique constraint covering the columns `[phonenumber]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_phonenumber_key` ON `user`(`phonenumber`);
