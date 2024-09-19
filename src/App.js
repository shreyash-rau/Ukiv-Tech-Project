


import React, { useState } from 'react';
import Collab from '../src/Comp/Collab';


const App = () => {
  const [namespace, setNamespace] = useState('namespace1/project1');
  const [room, setRoom] = useState('doc1');
  const [connect, setConnect] = useState(false);

  const connectEditor = () => {
    setConnect(true);
  };

  return (
    <div>
      {connect ? (
        <Collab namespace={namespace} room={room} />
      ) : (
        <div>
          <input
            type="text"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
          />
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={connectEditor}>Join Editor</button>
        </div>
      )}
    </div>
  );
};

export default App;
