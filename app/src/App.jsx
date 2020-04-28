import React from 'react';
import './App.css';
import Home from './Views/Home';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Room from './Views/Room';


const App = () => {
  return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/room/:id" component={Room} />
          </Switch>
      </BrowserRouter>
  );
};



export default App;
