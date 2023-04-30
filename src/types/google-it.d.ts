declare module 'google-it' {
    interface GoogleItOptions {
      query: string;
      disableConsole?: boolean;
    }
  
    interface GoogleItResult {
      link: string;
      title: string;
      snippet: string;
    }
  
    function googleIt(options: GoogleItOptions): Promise<GoogleItResult[]>;
  
    export = googleIt;
}
  