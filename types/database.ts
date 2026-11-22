// Generated from the database schema by the Supabase CLI. Do not edit by hand.
// Regenerate after each database change: see docs/SETUP.md.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["admin_role"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"];
          actor_email: string | null;
          actor_id: string | null;
          changes: Json | null;
          id: number;
          occurred_at: string;
          record_id: string | null;
          record_label: string | null;
          table_name: string;
        };
        ComputedFields: never;
        Insert: {
          action: Database["public"]["Enums"]["audit_action"];
          actor_email?: string | null;
          actor_id?: string | null;
          changes?: Json | null;
          id?: never;
          occurred_at?: string;
          record_id?: string | null;
          record_label?: string | null;
          table_name: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["audit_action"];
          actor_email?: string | null;
          actor_id?: string | null;
          changes?: Json | null;
          id?: never;
          occurred_at?: string;
          record_id?: string | null;
          record_label?: string | null;
          table_name?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          address: string | null;
          archived_at: string | null;
          classification: Database["public"]["Enums"]["company_classification"];
          cover_media_id: string | null;
          created_at: string;
          created_by: string | null;
          email: string | null;
          established_year: number | null;
          full_description: Json | null;
          id: string;
          logo_media_id: string | null;
          name: string;
          parent_company_id: string | null;
          phone: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
          updated_by: string | null;
          website: string | null;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          archived_at?: string | null;
          classification: Database["public"]["Enums"]["company_classification"];
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          established_year?: number | null;
          full_description?: Json | null;
          id?: string;
          logo_media_id?: string | null;
          name: string;
          parent_company_id?: string | null;
          phone?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          archived_at?: string | null;
          classification?: Database["public"]["Enums"]["company_classification"];
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          established_year?: number | null;
          full_description?: Json | null;
          id?: string;
          logo_media_id?: string | null;
          name?: string;
          parent_company_id?: string | null;
          phone?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_cover_media_id_fkey";
            columns: ["cover_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_logo_media_id_fkey";
            columns: ["logo_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_parent_company_id_fkey";
            columns: ["parent_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_relationships: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_date: string | null;
          from_company_id: string;
          id: string;
          published_at: string | null;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          sort_order: number;
          start_date: string | null;
          status: Database["public"]["Enums"]["content_status"];
          to_company_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          from_company_id: string;
          id?: string;
          published_at?: string | null;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          sort_order?: number;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          to_company_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_date?: string | null;
          from_company_id?: string;
          id?: string;
          published_at?: string | null;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          sort_order?: number;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          to_company_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_relationships_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_relationships_from_company_id_fkey";
            columns: ["from_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_relationships_to_company_id_fkey";
            columns: ["to_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_relationships_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_sectors: {
        Row: {
          company_id: string;
          created_at: string;
          is_primary: boolean;
          sector_id: string;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          is_primary?: boolean;
          sector_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          is_primary?: boolean;
          sector_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_sectors_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_sectors_sector_id_fkey";
            columns: ["sector_id"];
            isOneToOne: false;
            referencedRelation: "sectors";
            referencedColumns: ["id"];
          },
        ];
      };
      enquiries: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          ip_hash: string | null;
          is_read: boolean;
          message: string;
          name: string;
          organisation: string | null;
          phone: string | null;
          subject: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          ip_hash?: string | null;
          is_read?: boolean;
          message: string;
          name: string;
          organisation?: string | null;
          phone?: string | null;
          subject?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          ip_hash?: string | null;
          is_read?: boolean;
          message?: string;
          name?: string;
          organisation?: string | null;
          phone?: string | null;
          subject?: string | null;
        };
        Relationships: [];
      };
      investment_private_details: {
        Row: {
          amount: number | null;
          created_at: string;
          created_by: string | null;
          currency: string | null;
          investment_id: string;
          notes: string | null;
          stake_percentage: number | null;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string | null;
          investment_id: string;
          notes?: string | null;
          stake_percentage?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string | null;
          investment_id?: string;
          notes?: string | null;
          stake_percentage?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "investment_private_details_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investment_private_details_investment_id_fkey";
            columns: ["investment_id"];
            isOneToOne: true;
            referencedRelation: "investments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investment_private_details_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      investments: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by: string | null;
          description: Json | null;
          id: string;
          investee_company_id: string;
          investment_date: string | null;
          investment_status: Database["public"]["Enums"]["investment_status"];
          investor_company_id: string;
          logo_media_id: string | null;
          nature: Database["public"]["Enums"]["investment_nature"];
          nature_note: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          summary: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: Json | null;
          id?: string;
          investee_company_id: string;
          investment_date?: string | null;
          investment_status?: Database["public"]["Enums"]["investment_status"];
          investor_company_id: string;
          logo_media_id?: string | null;
          nature: Database["public"]["Enums"]["investment_nature"];
          nature_note?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: Json | null;
          id?: string;
          investee_company_id?: string;
          investment_date?: string | null;
          investment_status?: Database["public"]["Enums"]["investment_status"];
          investor_company_id?: string;
          logo_media_id?: string | null;
          nature?: Database["public"]["Enums"]["investment_nature"];
          nature_note?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "investments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investments_investee_company_id_fkey";
            columns: ["investee_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investments_investor_company_id_fkey";
            columns: ["investor_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investments_logo_media_id_fkey";
            columns: ["logo_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investments_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      leadership: {
        Row: {
          archived_at: string | null;
          biography: Json | null;
          category: Database["public"]["Enums"]["leadership_category"];
          created_at: string;
          created_by: string | null;
          display_order: number;
          full_name: string;
          id: string;
          job_title: string | null;
          photo_media_id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          biography?: Json | null;
          category: Database["public"]["Enums"]["leadership_category"];
          created_at?: string;
          created_by?: string | null;
          display_order?: number;
          full_name: string;
          id?: string;
          job_title?: string | null;
          photo_media_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          biography?: Json | null;
          category?: Database["public"]["Enums"]["leadership_category"];
          created_at?: string;
          created_by?: string | null;
          display_order?: number;
          full_name?: string;
          id?: string;
          job_title?: string | null;
          photo_media_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leadership_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leadership_photo_media_id_fkey";
            columns: ["photo_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leadership_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      leadership_affiliations: {
        Row: {
          company_id: string;
          created_at: string;
          leadership_id: string;
          role_title: string | null;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          leadership_id: string;
          role_title?: string | null;
          sort_order?: number;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          leadership_id?: string;
          role_title?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "leadership_affiliations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leadership_affiliations_leadership_id_fkey";
            columns: ["leadership_id"];
            isOneToOne: false;
            referencedRelation: "leadership";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          alt_text: string | null;
          bucket: string;
          caption: string | null;
          category: Database["public"]["Enums"]["media_category"];
          created_at: string;
          created_by: string | null;
          file_name: string;
          height: number | null;
          id: string;
          mime_type: string;
          path: string;
          size_bytes: number;
          updated_at: string;
          updated_by: string | null;
          width: number | null;
        };
        ComputedFields: never;
        Insert: {
          alt_text?: string | null;
          bucket: string;
          caption?: string | null;
          category?: Database["public"]["Enums"]["media_category"];
          created_at?: string;
          created_by?: string | null;
          file_name: string;
          height?: number | null;
          id?: string;
          mime_type: string;
          path: string;
          size_bytes: number;
          updated_at?: string;
          updated_by?: string | null;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          bucket?: string;
          caption?: string | null;
          category?: Database["public"]["Enums"]["media_category"];
          created_at?: string;
          created_by?: string | null;
          file_name?: string;
          height?: number | null;
          id?: string;
          mime_type?: string;
          path?: string;
          size_bytes?: number;
          updated_at?: string;
          updated_by?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      media_links: {
        Row: {
          caption: string | null;
          company_id: string | null;
          created_at: string;
          id: string;
          investment_id: string | null;
          leadership_id: string | null;
          media_id: string;
          news_id: string | null;
          project_id: string | null;
          role: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          caption?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          investment_id?: string | null;
          leadership_id?: string | null;
          media_id: string;
          news_id?: string | null;
          project_id?: string | null;
          role: string;
          sort_order?: number;
        };
        Update: {
          caption?: string | null;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          investment_id?: string | null;
          leadership_id?: string | null;
          media_id?: string;
          news_id?: string | null;
          project_id?: string | null;
          role?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "media_links_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_links_investment_id_fkey";
            columns: ["investment_id"];
            isOneToOne: false;
            referencedRelation: "investments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_links_leadership_id_fkey";
            columns: ["leadership_id"];
            isOneToOne: false;
            referencedRelation: "leadership";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_links_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_links_news_id_fkey";
            columns: ["news_id"];
            isOneToOne: false;
            referencedRelation: "news";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      news: {
        Row: {
          archived_at: string | null;
          author_name: string | null;
          body: Json | null;
          cover_media_id: string | null;
          created_at: string;
          created_by: string | null;
          excerpt: string | null;
          id: string;
          is_featured: boolean;
          news_type: Database["public"]["Enums"]["news_type"];
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          author_name?: string | null;
          body?: Json | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          excerpt?: string | null;
          id?: string;
          is_featured?: boolean;
          news_type?: Database["public"]["Enums"]["news_type"];
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          author_name?: string | null;
          body?: Json | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          excerpt?: string | null;
          id?: string;
          is_featured?: boolean;
          news_type?: Database["public"]["Enums"]["news_type"];
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "news_cover_media_id_fkey";
            columns: ["cover_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "news_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "news_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      news_companies: {
        Row: {
          company_id: string;
          created_at: string;
          news_id: string;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          news_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          news_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "news_companies_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "news_companies_news_id_fkey";
            columns: ["news_id"];
            isOneToOne: false;
            referencedRelation: "news";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          archived_at: string | null;
          content: NonNullable<Json>;
          created_at: string;
          created_by: string | null;
          id: string;
          is_system: boolean;
          og_image_media_id: string | null;
          page_key: string;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string | null;
          status: Database["public"]["Enums"]["content_status"];
          template: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          content?: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_system?: boolean;
          og_image_media_id?: string | null;
          page_key: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          template?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          content?: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_system?: boolean;
          og_image_media_id?: string | null;
          page_key?: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          template?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pages_og_image_media_id_fkey";
            columns: ["og_image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pages_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      project_milestones: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          milestone_date: string | null;
          project_id: string;
          sort_order: number;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          milestone_date?: string | null;
          project_id: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          milestone_date?: string | null;
          project_id?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_milestones_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_milestones_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          archived_at: string | null;
          company_id: string;
          country: string;
          cover_media_id: string | null;
          created_at: string;
          created_by: string | null;
          description: Json | null;
          end_date: string | null;
          id: string;
          latitude: number | null;
          location_name: string | null;
          longitude: number | null;
          project_status: Database["public"]["Enums"]["project_status"];
          published_at: string | null;
          sector_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          start_date: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["content_status"];
          summary: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          company_id: string;
          country?: string;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: Json | null;
          end_date?: string | null;
          id?: string;
          latitude?: number | null;
          location_name?: string | null;
          longitude?: number | null;
          project_status?: Database["public"]["Enums"]["project_status"];
          published_at?: string | null;
          sector_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          start_date?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          company_id?: string;
          country?: string;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: Json | null;
          end_date?: string | null;
          id?: string;
          latitude?: number | null;
          location_name?: string | null;
          longitude?: number | null;
          project_status?: Database["public"]["Enums"]["project_status"];
          published_at?: string | null;
          sector_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          start_date?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_cover_media_id_fkey";
            columns: ["cover_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_sector_id_fkey";
            columns: ["sector_id"];
            isOneToOne: false;
            referencedRelation: "sectors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sectors: {
        Row: {
          archived_at: string | null;
          cover_media_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sectors_cover_media_id_fkey";
            columns: ["cover_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sectors_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sectors_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      website_settings: {
        Row: {
          contact_address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          id: number;
          logo_media_id: string | null;
          og_image_media_id: string | null;
          seo_default_description: string | null;
          seo_default_title: string | null;
          site_name: string;
          social_links: NonNullable<Json>;
          tagline: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          contact_address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          id?: number;
          logo_media_id?: string | null;
          og_image_media_id?: string | null;
          seo_default_description?: string | null;
          seo_default_title?: string | null;
          site_name?: string;
          social_links?: NonNullable<Json>;
          tagline?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          contact_address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          id?: number;
          logo_media_id?: string | null;
          og_image_media_id?: string | null;
          seo_default_description?: string | null;
          seo_default_title?: string | null;
          site_name?: string;
          social_links?: NonNullable<Json>;
          tagline?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "website_settings_logo_media_id_fkey";
            columns: ["logo_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "website_settings_og_image_media_id_fkey";
            columns: ["og_image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "website_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      submit_enquiry: {
        Args: {
          p_client_ip?: string;
          p_email: string;
          p_message: string;
          p_name: string;
          p_organisation?: string;
          p_phone?: string;
          p_subject?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      admin_role: "master_admin";
      audit_action: "insert" | "update" | "delete";
      company_classification: "group" | "business" | "subsidiary" | "external";
      content_status: "draft" | "published" | "archived";
      investment_nature:
        | "portfolio_investment"
        | "equity_stake"
        | "joint_venture"
        | "strategic_investment"
        | "other";
      investment_status: "active" | "pending" | "exited";
      leadership_category: "director" | "executive" | "management";
      media_category: "logo" | "photo" | "document" | "other";
      news_type:
        | "article"
        | "press_release"
        | "announcement"
        | "industry_update"
        | "company_news";
      project_status: "planned" | "in_progress" | "completed" | "on_hold";
      relationship_type:
        "strategic_partner" | "joint_venture" | "affiliate" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      admin_role: ["master_admin"],
      audit_action: ["insert", "update", "delete"],
      company_classification: ["group", "business", "subsidiary", "external"],
      content_status: ["draft", "published", "archived"],
      investment_nature: [
        "portfolio_investment",
        "equity_stake",
        "joint_venture",
        "strategic_investment",
        "other",
      ],
      investment_status: ["active", "pending", "exited"],
      leadership_category: ["director", "executive", "management"],
      media_category: ["logo", "photo", "document", "other"],
      news_type: [
        "article",
        "press_release",
        "announcement",
        "industry_update",
        "company_news",
      ],
      project_status: ["planned", "in_progress", "completed", "on_hold"],
      relationship_type: [
        "strategic_partner",
        "joint_venture",
        "affiliate",
        "other",
      ],
    },
  },
} as const;
