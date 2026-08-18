import prisma from "@/lib/prisma";
import { eventCardSelect } from "@/lib/events/event.select";

export async function getPartners() {
  return prisma.company.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      location: true,
    },
  });
}

export async function getPartnerBySlug(slug: string) {
    return prisma.company.findFirst({
        where:{
            slug,
            deletedAt:null,
            isActive:true
        },

        select:{
            id:true,
            name:true,
            slug:true,
            logo:true,
            description:true,
            location:true,
            website:true,
            instagram:true,
            linkedln:true,
            phone:true,
            email:true,
            isActive:true,

            events:{
                where:{
                    deletedAt:null,
                    isPublished:true
                },
                orderBy:{
                    startDate:"asc"
                },
                select:eventCardSelect
            }
        }
    });
}