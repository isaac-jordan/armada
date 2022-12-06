import React from "react"

import { ThemeProvider as ThemeProviderV4, createTheme as createThemeV4, StylesProvider } from "@material-ui/core"
import { createGenerateClassName } from '@material-ui/core/styles';
import { ThemeProvider as ThemeProviderV5, createTheme as createThemeV5 } from '@mui/material/styles';

import { Route, BrowserRouter as Router, Switch } from "react-router-dom"

import NavBar from "./components/NavBar"
import JobSetsContainer from "./containers/JobSetsContainer"
import JobsContainer from "./containers/JobsContainer"
import OverviewContainer from "./containers/OverviewContainer"
import { JobService } from "./services/JobService"
import LogService from "./services/LogService"

import "./App.css"
import { JobsTableContainer } from "containers/lookoutV2/JobsTableContainer"
import GetJobsService from "services/lookoutV2/GetJobsService"
import GroupJobsService from "services/lookoutV2/GroupJobsService"

type AppProps = {
  jobService: JobService
  v2GetJobsService: GetJobsService
  v2GroupJobsService: GroupJobsService
  logService: LogService
  overviewAutoRefreshMs: number
  jobSetsAutoRefreshMs: number
  jobsAutoRefreshMs: number
}

// Required for Mui V4 and V5 to be compatible with each other
// See https://mui.com/x/react-data-grid/migration-v4/#using-mui-core-v4-with-v5
const generateClassName = createGenerateClassName({
  // By enabling this option, if you have non-MUI elements (e.g. `<div />`)
  // using MUI classes (e.g. `.MuiButton`) they will lose styles.
  // Make sure to convert them to use `styled()` or `<Box />` first.
  disableGlobal: true,
  // Class names will receive this seed to avoid name collisions.
  seed: 'mui-jss',
});

const theme = {
  palette: {
    primary: {
      main: "#00aae1",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "'Segoe UI'",
      "'Roboto'",
      "'Oxygen'",
      "'Ubuntu'",
      "'Cantarell'",
      "'Fira Sans'",
      "'Droid Sans'",
      "'Helvetica Neue'",
      "sans-serif",
    ].join(","),
  },
}

const themeV4 = createThemeV4(theme)
const themeV5 = createThemeV5(theme)

export function App(props: AppProps) {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProviderV4 theme={themeV4}>
        <ThemeProviderV5 theme={themeV5}>
          <Router>
            <div className="app-container">
              <NavBar />
              <div className="app-content">
                <Switch>
                  <Route exact path="/">
                    <OverviewContainer {...props} />
                  </Route>
                  <Route exact path="/job-sets">
                    <JobSetsContainer {...props} />
                  </Route>
                  <Route exact path="/jobs">
                    <JobsContainer {...props} />
                  </Route>
                  <Route exact path="/v2">
                    <JobsTableContainer
                      getJobsService={props.v2GetJobsService}
                      groupJobsService={props.v2GroupJobsService}
                      debug={true}
                    />
                  </Route>
                </Switch>
              </div>
            </div>
          </Router>
        </ThemeProviderV5>
      </ThemeProviderV4>
    </StylesProvider>
  )
}
