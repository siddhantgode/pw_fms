import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import { collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import sanitizeHtml from 'sanitize-html';
import { db } from './firebase';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
} from 'react-icons/fa';
import 'draft-js/dist/Draft.css';

// Convert raw Draft.js content to HTML
const rawToHTML = (raw) => {
  try {
    if (!raw || typeof raw !== 'string') return '<p>No content</p>';
    const parsed = JSON.parse(raw);
    if (!parsed.blocks || !parsed.entityMap) return '<p>No content</p>';
    const contentState = convertFromRaw(parsed);

    let html = '';
    let listType = null;
    contentState.getBlocksAsArray().forEach((block, index) => {
      const text = block.getText();
      const type = block.getType();
      let tag = 'p';

      if (type === 'blockquote') tag = 'blockquote';
      if (type === 'unordered-list-item' || type === 'ordered-list-item') tag = 'li';

      let styledText = text;
      const characterList = block.getCharacterList();
      let currentStyle = '';
      characterList.forEach((char, i) => {
        const styles = char.getStyle().toArray();
        if (styles.includes('BOLD') && !currentStyle.includes('<b>')) {
          currentStyle = `<b>${currentStyle}`;
          styledText = styledText.slice(0, i) + '<b>' + styledText.slice(i);
        }
        if (styles.includes('ITALIC') && !currentStyle.includes('<i>')) {
          currentStyle = `<i>${currentStyle}`;
          styledText = styledText.slice(0, i) + '<i>' + styledText.slice(i);
        }
        if (styles.includes('UNDERLINE') && !currentStyle.includes('<u>')) {
          currentStyle = `<u>${currentStyle}`;
          styledText = styledText.slice(0, i) + '<u>' + styledText.slice(i);
        }
        const colorStyle = styles.find((s) => s.startsWith('COLOR-'));
        if (colorStyle && !currentStyle.includes(`color:${colorStyle.replace('COLOR-', '')}`)) {
          currentStyle = `<span style="color:${colorStyle.replace('COLOR-', '')}">${currentStyle}`;
          styledText =
            styledText.slice(0, i) +
            `<span style="color:${colorStyle.replace('COLOR-', '')}">` +
            styledText.slice(i);
        }
        if (!styles.includes('BOLD') && currentStyle.includes('<b>')) {
          styledText = styledText.slice(0, i) + '</b>' + styledText.slice(i);
          currentStyle = currentStyle.replace('<b>', '');
        }
        if (!styles.includes('ITALIC') && currentStyle.includes('<i>')) {
          styledText = styledText.slice(0, i) + '</i>' + styledText.slice(i);
          currentStyle = currentStyle.replace('<i>', '');
        }
        if (!styles.includes('UNDERLINE') && currentStyle.includes('<u>')) {
          styledText = styledText.slice(0, i) + '</u>' + styledText.slice(i);
          currentStyle = currentStyle.replace('<u>', '');
        }
        if (!colorStyle && currentStyle.includes('<span')) {
          styledText = styledText.slice(0, i) + '</span>' + styledText.slice(i);
          currentStyle = currentStyle.replace(/<span[^>]*>/, '');
        }
      });
      if (currentStyle.includes('<b>')) styledText += '</b>';
      if (currentStyle.includes('<i>')) styledText += '</i>';
      if (currentStyle.includes('<u>')) styledText += '</u>';
      if (currentStyle.includes('<span')) styledText += '</span>';

      if (type === 'unordered-list-item' && listType !== 'ul') {
        html += '<ul>';
        listType = 'ul';
      } else if (type === 'ordered-list-item' && listType !== 'ol') {
        html += '<ol>';
        listType = 'ol';
      } else if (type !== 'unordered-list-item' && listType === 'ul') {
        html += '</ul>';
        listType = null;
      } else if (type !== 'ordered-list-item' && listType === 'ol') {
        html += '</ol>';
        listType = null;
      }

      html += `<${tag}>${styledText || '<br>'}</${tag}>`;

      if (index === contentState.getBlocksAsArray().length - 1) {
        if (listType === 'ul') html += '</ul>';
        if (listType === 'ol') html += '</ol>';
      }
    });

    const sanitized = sanitizeHtml(html, {
      allowedTags: ['p', 'b', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'span'],
      allowedAttributes: { span: ['style'] },
      allowedStyles: {
        span: {
          color: [/^#[0-9a-fA-F]{6}$/],
        },
      },
    });

    return sanitized.length > 100 ? sanitized.slice(0, 100) + '...' : sanitized;
  } catch (err) {
    console.error('Error parsing content:', err);
    return '<p>Error rendering content</p>';
  }
};

const LogBook = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  // Fetch log entries from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'logbook'), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEntries(sorted);
    });
    return () => unsub();
  }, []);

  // Filter entries by date range
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const start = startDateTime ? new Date(startDateTime) : null;
    const end = endDateTime ? new Date(endDateTime) : null;

    if (start && end) {
      return entryDate >= start && entryDate <= end;
    }
    if (start) {
      return entryDate >= start;
    }
    if (end) {
      return entryDate <= end;
    }
    return true;
  });

  // Save the log entry
  const handleSave = async () => {
    if (!editorState) return;
    const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    const user = getAuth().currentUser;

    if (!user) {
      alert('Please sign in to save logbook entries.');
      return;
    }

    const entryData = {
      content,
      createdAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        name: user.displayName || user.email || 'Unknown User',
      },
    };

    if (selectedEntryId) {
      await updateDoc(doc(db, 'logbook', selectedEntryId), entryData);
    } else {
      await addDoc(collection(db, 'logbook'), entryData);
    }

    // Reset editor after save
    setSelectedEntryId(null);
    setEditorState(EditorState.createEmpty());
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntryId(entry.id);
    if (entry.content) {
      try {
        const contentState = convertFromRaw(JSON.parse(entry.content));
        setEditorState(EditorState.createWithContent(contentState));
      } catch (err) {
        console.error('Error loading entry:', err);
      }
    }
  };

  const handleNewEntry = () => {
    setSelectedEntryId(null);
    setEditorState(EditorState.createEmpty());
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleIndent = () => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const newContentState = Modifier.setBlockData(
      contentState,
      selectionState,
      {
        ...contentState.getBlockForKey(selectionState.getStartKey()).getData().toObject(),
        indent: (contentState.getBlockForKey(selectionState.getStartKey()).getData().get('indent') || 0) + 1,
      }
    );
    setEditorState(EditorState.push(editorState, newContentState, 'change-block-data'));
  };

  const handleOutdent = () => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const currentIndent = contentState.getBlockForKey(selectionState.getStartKey()).getData().get('indent') || 0;
    if (currentIndent > 0) {
      const newContentState = Modifier.setBlockData(
        contentState,
        selectionState,
        {
          ...contentState.getBlockForKey(selectionState.getStartKey()).getData().toObject(),
          indent: currentIndent - 1,
        }
      );
      setEditorState(EditorState.push(editorState, newContentState, 'change-block-data'));
    }
  };

  const applyColor = (color) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const newContentState = Modifier.applyInlineStyle(
        contentState,
        selection,
        `COLOR-${color}`
      );
      setEditorState(EditorState.push(editorState, newContentState, 'change-inline-style'));
    }
  };

  const colorPalette = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Fixed Title */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: '#fff',
          zIndex: 2,
          padding: '1rem',
          borderBottom: '1px solid #ccc',
        }}
      >
        <h1 style={{ textAlign: 'left', margin: 0 }}>LogBook</h1>
      </div>

      <div
        style={{
          display: 'flex',
          paddingTop: '60px',
          minHeight: 'calc(100vh - 60px)',
        }}
      >
        {/* Left: Entry List */}
        <div
          style={{
            width: '65%',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: '60px',
              background: '#fff',
              zIndex: 1,
              paddingBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Log Timeline</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={handleNewEntry}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  + New Entry
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem' }}>Start Date-Time:</label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem' }}>End Date-Time:</label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredEntries.length === 0 ? (
                <p>No entries</p>
              ) : (
                filteredEntries.map((entry) => {
                  const htmlPreview = rawToHTML(entry.content);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => handleSelectEntry(entry)}
                      style={{
                        padding: '0.5rem 0',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.85rem',
                          marginBottom: '0.5rem',
                          color: '#666',
                        }}
                      >
                        <strong>{entry.user?.name || 'Anonymous'}</strong> –{' '}
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : 'Unknown date'}
                      </div>
                      <div className="entry-preview">
                        {htmlPreview ? (
                          <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                        ) : (
                          <em style={{ color: '#888' }}>No preview available</em>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Fixed Editor */}
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: 0,
            width: '35%',
            height: 'calc(100vh - 60px)',
            padding: '1rem',
            background: '#fff',
            borderLeft: '1px solid #ccc',
            overflowY: 'auto',
            zIndex: 1,
          }}
        >
          <h3>{selectedEntryId ? 'Edit Entry' : 'New Entry'}</h3>

          {/* Formatting Buttons */}
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => toggleInlineStyle('BOLD')}
              title="Bold"
              style={{ padding: '0.5rem' }}
            >
              <FaBold />
            </button>
            <button
              onClick={() => toggleInlineStyle('ITALIC')}
              title="Italic"
              style={{ padding: '0.5rem' }}
            >
              <FaItalic />
            </button>
            <button
              onClick={() => toggleInlineStyle('UNDERLINE')}
              title="Underline"
              style={{ padding: '0.5rem' }}
            >
              <FaUnderline />
            </button>
            <button
              onClick={() => toggleBlockType('unordered-list-item')}
              title="Bullet List"
              style={{ padding: '0.5rem' }}
            >
              <FaListUl />
            </button>
            <button
              onClick={() => toggleBlockType('ordered-list-item')}
              title="Numbered List"
              style={{ padding: '0.5rem' }}
            >
              <FaListOl />
            </button>
            <button
              onClick={handleIndent}
              title="Indent"
              style={{ padding: '0.5rem' }}
            >
              <FaIndent />
            </button>
            <button
              onClick={handleOutdent}
              title="Outdent"
              style={{ padding: '0.5rem' }}
            >
              <FaOutdent />
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label>Color:</label>
              <select onChange={(e) => applyColor(e.target.value)} defaultValue="">
                <option value="" disabled>
                  Select Color
                </option>
                {colorPalette.map((color) => (
                  <option key={color} value={color} style={{ backgroundColor: color }}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              minHeight: '300px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Editor editorState={editorState} onChange={setEditorState} />
          </div>
          <button
            onClick={handleSave}
            style={{ padding: '0.5rem 1.2rem', width: '100%' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogBook;