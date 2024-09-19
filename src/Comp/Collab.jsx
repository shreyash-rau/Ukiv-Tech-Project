


import React, { useEffect, useState } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import { HardBreak, Heading, Bold, Code, Italic, History } from '@tiptap/starter-kit';
import { Collaboration as Collab, Cursors } from '@tiptap/extension-collaboration';
import randomColor from 'randomcolor';

const CollaborationEditor = ({ namespace, room }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientsIDs, setClientsIDs] = useState([]);
  const [colorsMap, setColorsMap] = useState({});
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const newEditor = new Editor({
      extensions: [
        HardBreak,
        Heading.configure({ levels: [1, 2, 3] }),
        Bold,
        Code,
        Italic,
        History,
        Collab.configure({
          socketServerBaseURL: 'http://localhost:6002',
          namespace,
          room,
          clientID: String(Math.floor(Math.random() * 0xFFFFFFFF)),
          debounce: 250,
          keepFocusOnBlur: false,
          onConnected: () => setLoading(false),
          onClientsUpdate: ({ clientsIDs, clientID }) => {
            setClientsIDs(clientsIDs);
            mapClientsToColors(clientID);
            makeClientColorStyles();
          },
          onDisconnected: () => setLoading(true),
          onSaving: () => setSaving(true),
          onSaved: () => setTimeout(() => setSaving(false), 500),
        }),
        Cursors,
      ],
    });

    setEditor(newEditor);

    return () => {
      newEditor.destroy();
      newEditor.extensionManager.extensions.find((e) => e.name === 'collaboration').closeSocket();
    };
  }, [namespace, room]);

  const mapClientsToColors = (clientID) => {
    const newColorsMap = { ...colorsMap };
    clientsIDs
      .filter((id) => id !== clientID)
      .filter((id) => !Object.keys(newColorsMap).includes(id))
      .forEach((id) => {
        newColorsMap[id] = randomColor();
      });
    setColorsMap(newColorsMap);
  };

  const makeClientColorStyles = () => {
    let clientsColorsStyle = document.getElementById('client-colors');
    if (clientsColorsStyle) clientsColorsStyle.remove();
    clientsColorsStyle = document.createElement('style');
    clientsColorsStyle.type = 'text/css';
    clientsColorsStyle.id = 'client-colors';
    Object.entries(colorsMap).forEach(([clientID, color]) => {
      clientsColorsStyle.innerHTML += `.cursor.client-${clientID}::before { background-color: ${color} }\n`;
      clientsColorsStyle.innerHTML += `.selection.client-${clientID} { background-color: ${color}20 }\n`;
    });
    document.getElementsByTagName('head')[0].appendChild(clientsColorsStyle);
  };

  return (
    <div className="editor">
      {editor && !loading ? (
        <>
          <div className="clientsIDs">
            • {clientsIDs.length} {clientsIDs.length === 1 ? 'user' : 'users'} connected to {namespace}/{room}
          </div>
          <EditorContent editor={editor} className="editor__content" />
          <div className="savingStatus">{saving ? 'Saving...' : 'Saved'}</div>
        </>
      ) : (
        <em>Connecting to socket server …</em>
      )}
    </div>
  );
};

export default CollaborationEditor;
