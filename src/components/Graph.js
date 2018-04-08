import React, { Component } from 'react';
import { 
  LineChart,
 Line,ResponsiveContainer,
 YAxis,
 XAxis,
 Tooltip,
 Label,
 ReferenceLine
 } from 'recharts';

class Graph extends Component {
  render() {
    var episodeRatings;
    if(this.props.showSeason == 0)
      episodeRatings=[].concat.apply([], this.props.seasonRatings);
    else
      episodeRatings=this.props.seasonRatings[this.props.showSeason-1];
    for(var i=0;i<episodeRatings.length;i++){
      episodeRatings[i].episodeNum=i+1;
    }
    return (
    <div id="graphContainer" className="container-fluid">
    <ResponsiveContainer className="chart" width="95%" height={700}>
        <LineChart data={episodeRatings}>
          <Line type="monotone" dataKey="rating" stroke="#8884d8" nameKey="name" strokeWidth={2} stroke="#32c17e"/>
          <Tooltip labelFormatter={(num)=> {
            var episode=episodeRatings[num-1];
            if(episode!==undefined)
              return "S"+episode.season+"E"+episode.episode+": "+episode.name;
            else
              return "Loading";
          }}/>
          <XAxis dataKey="episodeNum" padding={{ left: 10 }} stroke="#dce5ed" />
          <YAxis type="number" domain={[dataMin=> Math.floor(dataMin), dataMax=> Math.ceil(dataMax)]} allowDecimals={false} stroke="#dce5ed"/>
          {this.getReferenceLines(this.props.seasonRatings)}
        </LineChart>
    </ResponsiveContainer>
    <p id="yAxisLabel"> Rating </p>
    <p id="xAxisLabel"> Episode </p>
    </div>
    );
  }

  getReferenceLines(seasons){
    if(seasons== undefined)
      return;
    if(this.props.showSeason!=0)
      return [];
    var referenceLines=[];
    referenceLines.push(<ReferenceLine x={1} strokeDasharray="5 5" stroke="#678296"/>);
    var seasonsStart=1;
    for(var i=0;i<seasons.length-1;i++){
      var seasonsStart=seasonsStart+seasons[i].length;
      referenceLines.push(<ReferenceLine x={seasonsStart} strokeDasharray="5 5" stroke="#678296"/>);

    }
    return referenceLines;
  }

}

export default Graph;