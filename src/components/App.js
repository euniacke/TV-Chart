import React, { Component } from 'react';
import HomeScreen from './HomeScreen';
import GraphView from './GraphView';



class App extends Component {
  constructor(props){
    super(props);
    var pathname= window.location.pathname.slice(1);
    this.state={series: "", loadedSeasons: 0, numOfSeasons: 0, pathname:pathname, seasons: []};
    this.updateSeries=this.updateSeries.bind(this);
  }

  render() {
    if(this.state.series=="" && this.state.pathname=="")
      return <HomeScreen updateMethod={this.updateSeries}/>;  
    else
      return <GraphView
      updateMethod={this.updateSeries}
      series={this.state.series}
      seasons={this.state.seasons}
      pathname={this.state.pathname}
      />;

    
  }

  updateSeries(series, seasons){
    this.setState({series:series, seasons:seasons, pathname:""});
  }

}

export default App;

