import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Key, KeysGroup } from './index';

const meta: Meta<typeof KeysGroup> = {
  title: 'RFC-001/VirtualKeyboard',
  component: KeysGroup,
};

export default meta;

export const InputExample: StoryObj = {
  render: () => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKey = (value: string) => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (value === 'del' || value === 'Backspace') {
        document.execCommand('delete', false);
      } else {
        document.execCommand('insertText', false, value);
      }
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h3>Input Example (RFC-001)</h3>
        <p>Click input to focus. Virtual keyboard appears and preserves focus when typing.</p>
        <input
          ref={inputRef}
          type="text"
          placeholder="Click here to focus..."
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            width: '300px',
            marginBottom: '16px',
            display: 'block',
          }}
        />

        {isFocused && (
          <KeysGroup
            layout={
              '"a a b b c c v v"' +
              '"d d d e e e v v"' +
              '". . del del . . . ."'
            }
            onKey={handleKey}
            onKeyDel={() => {
              document.execCommand('delete', false);
            }}
            preventFocusSteal={true}
            style={{
              display: 'grid',
              gap: '6px',
              padding: '12px',
              background: '#f0f0f0',
              borderRadius: '8px',
              maxWidth: '400px',
            }}
          >
            <Key style={keyStyle}>a</Key>
            <Key style={keyStyle}>b</Key>
            <Key style={keyStyle}>c</Key>
            <Key style={keyStyle}>d</Key>
            <Key style={keyStyle}>e</Key>
            <Key area="v" style={{ ...keyStyle, background: '#e0e0ff' }}>
              Enter
            </Key>
            <Key area="del" style={{ ...keyStyle, background: '#ffe0e0' }}>
              Del
            </Key>
          </KeysGroup>
        )}
      </div>
    );
  },
};

export const ContentEditableExample: StoryObj = {
  render: () => {
    const [isFocused, setIsFocused] = useState(false);
    const editableRef = useRef<HTMLDivElement>(null);

    const handleKey = (value: string) => {
      if (editableRef.current) {
        editableRef.current.focus();
      }
      if (value === 'del' || value === 'Backspace') {
        document.execCommand('delete', false);
      } else {
        document.execCommand('insertText', false, value);
      }
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h3>ContentEditable Example (RFC-001)</h3>
        <p>Click editable div below to focus. Virtual keyboard appears and preserves focus.</p>
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            padding: '12px',
            border: '2px dashed #999',
            minHeight: '60px',
            width: '300px',
            marginBottom: '16px',
            borderRadius: '4px',
            outline: 'none',
          }}
        >
          Type here...
        </div>

        {isFocused && (
          <KeysGroup
            layout={
              '"a a b b c c"' +
              '". d d e e ."' +
              '". . del del . ."'
            }
            onKey={handleKey}
            preventFocusSteal={true}
            style={{
              display: 'grid',
              gap: '6px',
              padding: '12px',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ccc',
              maxWidth: '350px',
            }}
          >
            <Key style={keyStyle}>a</Key>
            <Key style={keyStyle}>b</Key>
            <Key style={keyStyle}>c</Key>
            <Key style={keyStyle}>d</Key>
            <Key style={keyStyle}>e</Key>
            <Key area="del" style={{ ...keyStyle, background: '#ffcccc' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </Key>
          </KeysGroup>
        )}
      </div>
    );
  },
};

export const StandardStaggeredGrouping: StoryObj = {
  render: () => (
    <KeysGroup
      layout={
        '"a a b b c c"' +
        '". d d e e ."'
      }
      style={{ display: 'grid', gap: '8px', padding: '16px', background: '#eee', width: '300px' }}
    >
      <Key style={keyStyle}>a</Key>
      <Key style={keyStyle}>b</Key>
      <Key style={keyStyle}>c</Key>
      <Key style={keyStyle}>d</Key>
      <Key style={keyStyle}>e</Key>
    </KeysGroup>
  ),
};

export const ISOEnterKey: StoryObj = {
  render: () => (
    <KeysGroup
      layout={
        '"a a b b c c v v"' +
        '"d d d e e e v v"'
      }
      style={{ display: 'grid', gap: '8px', padding: '16px', background: '#eee', width: '350px' }}
    >
      <Key style={keyStyle}>a</Key>
      <Key style={keyStyle}>b</Key>
      <Key style={keyStyle}>c</Key>
      <Key style={keyStyle}>d</Key>
      <Key style={keyStyle}>e</Key>
      <Key area="v" style={{ ...keyStyle, background: '#b3d4fc' }}>Enter</Key>
    </KeysGroup>
  ),
};

const keyStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
