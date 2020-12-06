import React, { Suspense, lazy } from 'react';
import {  BrowserRouter   as Router, Route, Switch, Redirect } from 'react-router-dom';
import ViewProfile from '../../Components/ViewProfile/ViewProfile';

const App = lazy(() => import('../../App'));
const Home = lazy(() => import('../../CommonComponents/Home/Home'));
const Login = lazy(() => import('../../CommonComponents/LogIn/Login'));
const Registration = lazy(() => import('../../CommonComponents/Registretion/Registration'));
const ForgotPassword = lazy(() => import('../../CommonComponents/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('../../CommonComponents/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('../../Components/Dashboard/Dashboard'));
const Chat = lazy(() => import('../../Components/Chat/Chat'));
const MyProfile = lazy(() => import('../../Components/MyProfile/MyProfile'));
const NotFound = lazy(() => import('../../Components/NotFound/NotFound'));

const RouterComponent = (
    <Router>
        <Suspense fallback={<div>Loading...</div>}>
            <Switch>
                <Route  path="/app" component={App} />
                <Route  path="/Home" component={Home} />
                <Route  exact path="/" render = {(props) => (localStorage.getItem('auth-data') ?  (<Redirect to="/dashboard" />) : (<Login {...props} />))}/>
                <Route path="/registration" render = {(props) => (localStorage.getItem('auth-data') ?  (<Redirect to="/dashboard" />) : (<Registration {...props} />))}/>
                <Route path="/forgot-password" component={ForgotPassword} render = {(props) => (localStorage.getItem('auth-data') ?  (<Redirect to="/dashboard" />) : (<ForgotPassword {...props} />))}/>
                <Route path="/reset/:tokenId" component={ResetPassword} render = {(props) => (localStorage.getItem('auth-data') ?  (<Redirect to="/dashboard" />) : (<ResetPassword {...props} />))}/>                
                <Route path="/dashboard" render = {(props) => (localStorage.getItem('auth-data') ?  (<Dashboard {...props} />) : (<Redirect to="/" {...props} />))}/>
                <Route path="/profile" render = {(props) => (localStorage.getItem('auth-data') ?  (<MyProfile {...props} />) : (<Redirect to="/" />))}/>
                <Route path="/chat" render = {(props) => (localStorage.getItem('auth-data') ?  (<Chat {...props} />) : (<Redirect to="/" />))}/>
                <Route path="/user/:userId" render = {(props) => (localStorage.getItem('auth-data') ?  (<ViewProfile {...props} />) : (<Redirect to="/" />))}/>
                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
        </Suspense>
    </Router>
);

export default RouterComponent;