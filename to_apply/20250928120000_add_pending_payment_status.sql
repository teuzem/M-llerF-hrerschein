/*
          # [Structural] Add 'pending_payment' to application_status enum
          Adds a new value to the application_status enum to support the payment workflow.

          ## Query Description: [This is a safe, non-destructive operation that alters a data type. It adds the 'pending_payment' status to the list of possible application statuses, which is required for the application submission form to work correctly. No existing data will be affected.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Type: application_status
          
          ## Security Implications:
          - RLS Status: Not Applicable
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible
          */
ALTER TYPE public.application_status ADD VALUE 'pending_payment' BEFORE 'submitted';
