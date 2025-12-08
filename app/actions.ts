"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { Invoice } from "../type";

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser && name) {
      await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

const generateUniqueId = async () => {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = randomBytes(3).toString("hex");
    const existingInvoice = await prisma.invoice.findUnique({
      where: {
        id: uniqueId,
      },
    });
    if (!existingInvoice) {
      isUnique = true;
    }
  }
  return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    const invoiceId = (await generateUniqueId()) as string;

    if (user) {
      const newInvoice = await prisma.invoice.create({
        data: {
          id: invoiceId,
          name: name,
          userId: user?.id,
          issuerName: "",
          issuerAddress: "",
          clientName: "",
          clientAddress: "",
          invoiceDate: "",
          dueDate: "",
          vatActive: false,
          vatRate: 20,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getInvoicesByEmail(email: string) {
  if (!email) return;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        invoices: {
          include: {
            lines: true,
          },
        },
      },
    });
    // Statuts possibles :
    // 1: Brouillon
    // 2: En attente
    // 3: Payée
    // 4: Annulée
    // 5: Impayé
    if (user) {
      const today = new Date();
      const updatedInvoices = await Promise.all(
        user.invoices.map(async (invoice) => {
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < today && invoice.status == 2) {
            const updatedInvoice = await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: 5 },
              include: { lines: true },
            });
            return updatedInvoice;
          }
          return invoice;
        })
      );
      return updatedInvoices;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lines: true,
      },
    });
    if (!invoice) {
      throw new Error("Facture non trouvée.");
    }
    return invoice;
  } catch (error) {
    console.error(error);
  }
}

export async function updateInvoice(invoice: Invoice) {
  try {
    // 1. Fetch the existing invoice from the database with its lines
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        lines: true,
      },
    });

    // 2. If invoice does not exist, throw an error
    if (!existingInvoice) {
      throw new Error(`Facture avec l'ID ${invoice.id} introuvable.`);
    }

    // 3. Update the left-level invoice fields (not the lines)
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        issuerName: invoice.issuerName,
        issuerAddress: invoice.issuerAddress,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        vatActive: invoice.vatActive,
        vatRate: invoice.vatRate,
        status: invoice.status,
      },
    });

    // Store old lines from DB and new lines from frontend
    const existingLines = existingInvoice.lines; // DB lines
    const receivedLines = invoice.lines; // frontend lines

    // 4. Find lines that exist in DB but not in the updated invoice → should be deleted
    const linesToDelete = existingLines.filter(
      (existingLine) =>
        !receivedLines.some((line) => line.id === existingLine.id)
    );

    // 5. Delete removed lines
    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: {
          id: { in: linesToDelete.map((line) => line.id) },
        },
      });
    }

    // 6. Loop through each updated/received line
    for (const line of receivedLines) {
      // Check if this line already exists in the DB
      const existingLine = existingLines.find((l) => l.id == line.id);
      if (existingLine) {
        // 7. Line exists → check if something changed
        const hasChanged =
          line.description !== existingLine.description ||
          line.quantity !== existingLine.quantity ||
          line.unitPrice !== existingLine.unitPrice;

        // If changed → update the line
        if (hasChanged) {
          await prisma.invoiceLine.update({
            where: { id: line.id },
            data: {
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            },
          });
        }
      } else {
        // 8. Line did not exist → it's a NEW line → create it
        await prisma.invoiceLine.create({
          data: {
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            invoiceId: invoice.id, // link to the parent invoice
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}


export async function deleteInvoice(invoiceId: string) {
    try {
        const deleteInvoice = await prisma.invoice.delete({
            where: { id: invoiceId }
        })
        if (!deleteInvoice) {
            throw new Error("Erreur lors de la suppression de la facture.");
        }
    } catch (error) {
        console.error(error)
    }
}
