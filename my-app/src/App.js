import React, {
    useState,
    useEffect,
} from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import axios from 'axios';

const DailyBlockCounts = ({
    data
}) => {
    return ( <
        ResponsiveContainer width = "100%"
        height = {
            300
        } >
        <
        LineChart data = {
            data
        }
        margin = {
            {
                top: 5,
                right: 20,
                left: 10,
                bottom: 5
            }
        } >
        <
        CartesianGrid strokeDasharray = "3 3" / >
        <
        XAxis dataKey = "date" / >
        <
        YAxis / >
        <
        Tooltip / >
        <
        Legend / >
        <
        Line type = "monotone"
        dataKey = "count"
        stroke = "#8884d8"
        activeDot = {
            {
                r: 8
            }
        }
        /> < /
        LineChart > <
        /ResponsiveContainer>
    );
};

// Define your GraphQL query
const query = `
query {
  bitcoin {
    blocks(options: {desc: "date.date", limit: 365}) {
      date {
        date
      }
      count
    }
  }
}
`;
const postData = {
  query: query
};

// Define the URL of your GraphQL API endpoint
const url = 'https://graphql.bitquery.io';
const token = 'BQY5zH8uvBQ1h2sMZXogQTnkKc2Hk9QA';

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': `${token}` // Include the bearer token in the Authorization header
  }
};

async function asyncFetch() {
     const waitData = await axios.post(url, postData, config)
      .then(response => {
        console.log("response: ", response);
        const aggregated = response.data.data.bitcoin.blocks.map(obj => ({
          date: obj.date.date,
          count: obj.count
        }));

        console.log("aggregated: ", aggregated);
        return aggregated.reverse();
      })
      .catch(error => {
        console.error('Error:', error);
      });

     console.log(waitData);
     return waitData;
};

const App = () => {
    const [allData, setData] = useState([]);

    // State for the filtered data
    const [filteredData, setFilteredData] = useState([]);

    // State for the selected time range
    const [timeRange, setTimeRange] = useState('1M');

    // Function to filter data based on time range
    const filterData = (range) => {
        setTimeRange(range);
        const endDate = moment();
        const startDate = endDate.clone().subtract(range === '1Y' ? 12 : range, 'months');

        console.log("allData: ", allData);
        return allData.filter((data) => {
            const dataDate = moment(data.date, 'YYYY-MM-DD');
            return dataDate.isBetween(startDate, endDate, undefined, '[]'); // inclusive of start and end date
        });
    };

    // Effect to set the default filtered data to the last 1 month
    useEffect(() => {
        asyncFetch().then(data => setData(data));
    }, []); // Empty dependency array to run only once on mount

    // Handler for time range change
    const handleTimeRangeChange = (range) => {
        const newFilteredData = filterData(range);
        setFilteredData(newFilteredData);
    };

    return ( <
        div style = {
            {
                width: '100%',
                height: '400px'
            }
        } >
        <
        h2 > Daily Block Counts < /h2> <
        div style = {
            {
                position: 'absolute',
                top: '10px',
                right: '10px'
            }
        } >
        <
        button onClick = {
            () => handleTimeRangeChange('1')
        }
        disabled = {
            timeRange === '1'
        } > 1 M < /button> <
        button onClick = {
            () => handleTimeRangeChange('3')
        }
        disabled = {
            timeRange === '3'
        } > 3 M < /button> <
        button onClick = {
            () => handleTimeRangeChange('12')
        }
        disabled = {
            timeRange === '12'
        } > 1 Y < /button> <
        /div> <
        DailyBlockCounts data = {
            filteredData
        }
        /> <
        p > Update time: {
            moment().format('YYYY-MM-DD')
        } < /p> <
        /div>
    );
};

export default App;