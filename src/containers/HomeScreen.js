import React, { Component } from 'react';
import SearchBox from './SearchBox';
import About from './About';

class HomeScreen extends Component{
  constructor(props){
    super(props);
    this.state={visible:false};
  }

  render(){
      return (
      <div id="homeScreenContainer" className={"container-fluid d-flex flex-column align-items-center bg-dark"+ (this.state.visible? " show":" hide")}>
        <div className="centerContainer d-flex flex-column align-items-center">
          <h1 className="display-2 text-white mx-auto">TV Chart</h1><br/>
          <SearchBox updateMethod={this.props.updateMethod} wide={true} pathname={""}/>
        </div>
        <About/>
      </div>
      );
  }

  componentDidMount(){
    this.setState({visible: true});
  }

}

export default HomeScreen;