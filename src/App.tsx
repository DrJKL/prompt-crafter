import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';
function App() {
  return (
    <>
      <CssBaseline />
      <div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4">
        <AppBar classes="grid">
          <Toolbar className="flex flex-auto justify-between">
            <Typography className="flex-auto" variant="h5" color="initial">
              Prompt Crafter
            </Typography>
            <Typography className="flex-auto" variant="h6" color="initial">
              v0.0.1
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <main className="p-4">Main stuff</main>
      </div>
    </>
  );
}

export default App;
