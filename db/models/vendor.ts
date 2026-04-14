import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

/**
 * Types de vendeurs USSEIN Commerce
 * - student     : étudiant individuel
 * - association : BDE, associations étudiantes
 * - department  : UFR / Département officiel
 * - official    : Librairie / boutique officielle USSEIN
 */
export const vendorTypeEnum = pgEnum("vendor_type", [
  "student",
  "association",
  "department",
  "official",
]);

/**
 * Statuts du compte vendeur
 * - pending   : en attente de validation par l'admin USSEIN
 * - active    : validé et visible
 * - suspended : suspendu (fraude, signalement)
 * - closed    : fermé par le vendeur
 */
export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "active",
  "suspended",
  "closed",
]);

export const vendorTable = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),

  // Identité de la boutique
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),        // ex: "bde-sciences-techno"
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 255 }),
  bannerUrl: varchar("banner_url", { length: 255 }),

  // Contexte universitaire
  type: varchar("type", { length: 50 }).notNull().default("student"),
  ufr: varchar("ufr", { length: 100 }),                             // ex: "FST", "FDSP"
  studentId: varchar("student_id", { length: 50 }),                 // Numéro matricule USSEIN

  // Paiement Wave / Orange Money
  waveNumber: varchar("wave_number", { length: 15 }),               // Numéro Wave du vendeur
  orangeMoneyNumber: varchar("orange_money_number", { length: 15 }),
  freeMoneyNumber: varchar("free_money_number", { length: 15 }),

  // Livraison campus
  campusDelivery: boolean("campus_delivery").default(true),
  deliveryZones: jsonb("delivery_zones"),                           // JSON: zones livrées sur campus

  // Métriques
  rating: integer("rating").default(0),                            // Note / 50 (x10 pour décimales)
  totalSales: integer("total_sales").default(0),
  totalRevenue: integer("total_revenue").default(0),               // En FCFA

  // Statut & admin
  status: varchar("status", { length: 50 }).notNull().default("active"),
  isVerified: boolean("is_verified").default(false),               // Compte étudiant vérifié
  verifiedAt: timestamp("verified_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorInsertSchema = createInsertSchema(vendorTable);
export const vendorSelectSchema = createSelectSchema(vendorTable);

export type VendorInsert = z.infer<typeof vendorInsertSchema>;
export type VendorSelect = z.infer<typeof vendorSelectSchema>;
