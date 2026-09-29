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
          inputMode="none"
          placeholder="Click here to focus..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
              setIsFocused(false);
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
      if (!editableRef.current) return;

      editableRef.current.focus();

      const selection = window.getSelection();
      if (
        selection &&
        (selection.rangeCount === 0 ||
          !editableRef.current.contains(selection.anchorNode))
      ) {
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      if (value === 'del' || value === 'Backspace') {
        document.execCommand('delete', false);
      } else {
        document.execCommand('insertText', false, value);
      }
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <style>{`
          .contenteditable-input:empty:before {
            content: attr(data-placeholder);
            color: #999;
            pointer-events: none;
            display: inline-block;
          }
          .contenteditable-input:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }
        `}</style>
        <h3>ContentEditable Example (RFC-001)</h3>
        <p>Click editable div below to focus. Virtual keyboard appears and preserves focus.</p>
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Type here..."
          inputMode="none"
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
  
              setIsFocused(false);
      
          }}
          className="contenteditable-input"
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            lineHeight: '20px',
            width: '300px',
            height: '38px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            backgroundColor: '#fff',
            cursor: 'text',
            outline: 'none',
          }}
        />

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
