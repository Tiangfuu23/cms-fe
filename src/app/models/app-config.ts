export interface IAppConfig {
  beUrl: string,
  supabaseUrl: string,
  supabaseKey: string;
  staticFileUrl: string;
}
export const INIT_APP_CONFIG: IAppConfig = {
  beUrl: 'http://localhost:5018',
  supabaseUrl: 'https://dlpfdxwejpnavgjhfjwf.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZkeHdlanBuYXZnamhmandmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU3NjEzMjEsImV4cCI6MjAzMTMzNzMyMX0.aqhsL58LgpW4JA4-rLPKu3oTdJbqzWc-h6EJMDEEt1c',
  staticFileUrl: 'http://localhost:5018/StaticFiles'
};
