-- Migration: Fix mutable search_path security issues
-- All functions should have SET search_path = '' to prevent search path hijacking

-- Fix check_session_capacity
ALTER FUNCTION public.check_session_capacity SET search_path = '';

-- Fix cleanup_old_events
ALTER FUNCTION public.cleanup_old_events SET search_path = '';

-- Fix generate_session_code
ALTER FUNCTION public.generate_session_code SET search_path = '';

-- Fix update_updated_at_column
ALTER FUNCTION public.update_updated_at_column SET search_path = '';

-- Fix get_session_details  
ALTER FUNCTION public.get_session_details SET search_path = '';

-- Fix update_user_stats
ALTER FUNCTION public.update_user_stats SET search_path = '';

-- Fix handle_new_user (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user SET search_path = '';
    END IF;
END $$;

-- Fix any other functions in public schema
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = ''''', 
                          func_record.proname, func_record.args);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter function %: %', func_record.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Add comment
COMMENT ON SCHEMA public IS 'Standard public schema with secured function search paths';
