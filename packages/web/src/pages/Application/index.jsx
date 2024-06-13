import * as React from 'react';
import {
  Link,
  Route,
  Navigate,
  Routes,
  useParams,
  useSearchParams,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';

import useFormatMessage from 'hooks/useFormatMessage';
import useAppConfig from 'hooks/useAppConfig.ee';
import useCurrentUserAbility from 'hooks/useCurrentUserAbility';
import * as URLS from 'config/urls';
import SplitButton from 'components/SplitButton';
import ConditionalIconButton from 'components/ConditionalIconButton';
import AppConnections from 'components/AppConnections';
import AppFlows from 'components/AppFlows';
import AddAppConnection from 'components/AddAppConnection';
import AppIcon from 'components/AppIcon';
import Container from 'components/Container';
import PageTitle from 'components/PageTitle';
import useApp from 'hooks/useApp';

const ReconnectConnection = (props) => {
  const { application, onClose } = props;
  const { connectionId } = useParams();

  return (
    <AddAppConnection
      onClose={onClose}
      application={application}
      connectionId={connectionId}
    />
  );
};

export default function Application() {
  const theme = useTheme();
  const matchSmallScreens = useMediaQuery(theme.breakpoints.down('md'));
  const formatMessage = useFormatMessage();
  const connectionsPathMatch = useMatch({
    path: URLS.APP_CONNECTIONS_PATTERN,
    end: false,
  });
  const flowsPathMatch = useMatch({ path: URLS.APP_FLOWS_PATTERN, end: false });
  const [searchParams] = useSearchParams();
  const { appKey } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useApp(appKey);
  const app = data?.data || {};

  const { data: appConfig } = useAppConfig(appKey);
  const connectionId = searchParams.get('connectionId') || undefined;

  const currentUserAbility = useCurrentUserAbility();

  const goToApplicationPage = () => navigate('connections');

  const connectionOptions = React.useMemo(() => {
    const shouldHaveCustomConnection =
      appConfig?.data?.canConnect && appConfig?.data?.canCustomConnect;

    const options = [
      {
        label: formatMessage('app.addConnection'),
        key: 'addConnection',
        'data-test': 'add-connection-button',
        to: URLS.APP_ADD_CONNECTION(appKey, appConfig?.data?.canConnect),
        disabled: !currentUserAbility.can('create', 'Connection'),
      },
    ];

    if (shouldHaveCustomConnection) {
      options.push({
        label: formatMessage('app.addCustomConnection'),
        key: 'addCustomConnection',
        'data-test': 'add-custom-connection-button',
        to: URLS.APP_ADD_CONNECTION(appKey),
        disabled: !currentUserAbility.can('create', 'Connection'),
      });
    }

    return options;
  }, [appKey, appConfig?.data, currentUserAbility]);

  if (loading) return null;

  return (
    <>
      <Box sx={{ py: 3 }}>
        <Container>
          <Grid container sx={{ mb: 3 }} alignItems="center">
            <Grid item xs="auto" sx={{ mr: 3 }}>
              <AppIcon
                url={app.iconUrl}
                color={app.primaryColor}
                name={app.name}
              />
            </Grid>

            <Grid item xs>
              <PageTitle>{app.name}</PageTitle>
            </Grid>

            <Grid item xs="auto">
              <Routes>
                <Route
                  path={`${URLS.FLOWS}/*`}
                  element={
                    <ConditionalIconButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      component={Link}
                      to={URLS.CREATE_FLOW_WITH_APP_AND_CONNECTION(
                        appKey,
                        connectionId,
                      )}
                      fullWidth
                      icon={<AddIcon />}
                      disabled={!currentUserAbility.can('create', 'Flow')}
                    >
                      {formatMessage('app.createFlow')}
                    </ConditionalIconButton>
                  }
                />

                <Route
                  path={`${URLS.CONNECTIONS}/*`}
                  element={
                    <SplitButton
                      disabled={
                        (appConfig?.data &&
                          !appConfig?.data?.canConnect &&
                          !appConfig?.data?.canCustomConnect) ||
                        connectionOptions.every(({ disabled }) => disabled)
                      }
                      options={connectionOptions}
                    />
                  }
                />
              </Routes>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  variant={matchSmallScreens ? 'fullWidth' : undefined}
                  value={
                    connectionsPathMatch?.pattern?.path ||
                    flowsPathMatch?.pattern?.path
                  }
                >
                  <Tab
                    label={formatMessage('app.connections')}
                    to={URLS.APP_CONNECTIONS(appKey)}
                    value={URLS.APP_CONNECTIONS_PATTERN}
                    disabled={!app.supportsConnections}
                    component={Link}
                    data-test="connections-tab"
                  />

                  <Tab
                    label={formatMessage('app.flows')}
                    to={URLS.APP_FLOWS(appKey)}
                    value={URLS.APP_FLOWS_PATTERN}
                    component={Link}
                    data-test="flows-tab"
                  />
                </Tabs>
              </Box>

              <Routes>
                <Route
                  path={`${URLS.FLOWS}/*`}
                  element={<AppFlows appKey={appKey} />}
                />

                <Route
                  path={`${URLS.CONNECTIONS}/*`}
                  element={<AppConnections appKey={appKey} />}
                />

                <Route
                  path="/"
                  element={
                    <Navigate
                      to={
                        app.supportsConnections
                          ? URLS.APP_CONNECTIONS(appKey)
                          : URLS.APP_FLOWS(appKey)
                      }
                      replace
                    />
                  }
                />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Routes>
        <Route
          path="/connections/add"
          element={
            <AddAppConnection onClose={goToApplicationPage} application={app} />
          }
        />

        <Route
          path="/connections/:connectionId/reconnect"
          element={
            <ReconnectConnection
              application={app}
              onClose={goToApplicationPage}
            />
          }
        />
      </Routes>
    </>
  );
}
