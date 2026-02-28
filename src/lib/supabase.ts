const supabaseUrl = 'https://vyodcuztcujyagmypknq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2RjdXp0Y3VqeWFnbXlwa25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk5NjgsImV4cCI6MjA4Nzg1NTk2OH0.QX6lAHEUpMwhVfmeUducbY2-h96Ol106pnEqI00zdIA';

const getHeaders = () => ({
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

// Simple proxy-like client to mimic Supabase library syntax using fetch
export const supabase: any = {
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        let query = `${supabaseUrl}/rest/v1/${table}?select=${columns}`;
        return {
          eq: (column: string, value: any) => {
            query += `&${column}=eq.${encodeURIComponent(value)}`;
            return {
              single: async () => {
                try {
                  const res = await fetch(query, {
                    headers: { ...getHeaders(), 'Accept': 'application/vnd.pgrst.object+json' }
                  });
                  if (res.status === 406) return { data: null, error: { code: 'PGRST116' } }; // Not found
                  const data = await res.json();
                  return { data, error: res.ok ? null : data };
                } catch (e) {
                  return { data: null, error: e };
                }
              },
              maybeSingle: async () => {
                try {
                  const res = await fetch(query, {
                    headers: { ...getHeaders(), 'Accept': 'application/vnd.pgrst.object+json' }
                  });
                  if (res.status === 406) return { data: null, error: null };
                  const data = await res.json();
                  return { data, error: res.ok ? null : data };
                } catch (e) {
                  return { data: null, error: e };
                }
              },
              then: async (resolve: any) => {
                try {
                  const res = await fetch(query, { headers: getHeaders() });
                  const data = await res.json();
                  resolve({ data, error: res.ok ? null : data });
                } catch (e) {
                  resolve({ data: null, error: e });
                }
              }
            };
          },
          order: (column: string, { ascending = true } = {}) => {
            query += `&order=${column}.${ascending ? 'asc' : 'desc'}`;
            return {
              then: async (resolve: any) => {
                try {
                  const res = await fetch(query, { headers: getHeaders() });
                  const data = await res.json();
                  resolve({ data, error: res.ok ? null : data });
                } catch (e) {
                  resolve({ data: null, error: e });
                }
              }
            };
          },
          then: async (resolve: any) => {
            try {
              const res = await fetch(query, { headers: getHeaders() });
              const data = await res.json();
              resolve({ data, error: res.ok ? null : data });
            } catch (e) {
              resolve({ data: null, error: e });
            }
          }
        };
      },
      insert: (values: any[]) => {
        return {
          select: () => ({
            single: async () => {
              try {
                const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                  method: 'POST',
                  headers: { ...getHeaders(), 'Prefer': 'return=representation', 'Accept': 'application/vnd.pgrst.object+json' },
                  body: JSON.stringify(values)
                });
                const data = await res.json();
                return { data, error: res.ok ? null : data };
              } catch (e) {
                return { data: null, error: e };
              }
            }
          }),
          then: async (resolve: any) => {
            try {
              const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                method: 'POST',
                headers: { ...getHeaders(), 'Prefer': 'return=minimal' },
                body: JSON.stringify(values)
              });
              resolve({ data: null, error: res.ok ? null : { message: 'Insert failed' } });
            } catch (e) {
              resolve({ data: null, error: e });
            }
          }
        };
      },
      update: (values: any) => {
        return {
          eq: (column: string, value: any) => {
            const query = `${supabaseUrl}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`;
            return {
              then: async (resolve: any) => {
                try {
                  const res = await fetch(query, {
                    method: 'PATCH',
                    headers: { ...getHeaders(), 'Prefer': 'return=minimal' },
                    body: JSON.stringify(values)
                  });
                  resolve({ data: null, error: res.ok ? null : { message: 'Update failed' } });
                } catch (e) {
                  resolve({ data: null, error: e });
                }
              }
            };
          }
        };
      }
    };
  },
  channel: () => ({
    on: function() { return this; },
    subscribe: function() { return this; }
  }),
  removeChannel: () => {}
};