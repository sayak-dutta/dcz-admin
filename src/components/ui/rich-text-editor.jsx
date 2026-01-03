import React, { useState, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { cn } from '@/lib/utils';
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Heading3, Eye } from 'lucide-react';
import { Button } from './button';

export const RichTextEditor = React.forwardRef(({
	value,
	onChange,
	className,
	placeholder = 'Enter content...',
	...props
}, ref) => {
	const editorRef = useRef(null);
	const [showPreview, setShowPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState(value || '');

	React.useEffect(() => {
		if (value !== undefined) {
			setHtmlContent(value);
		}
	}, [value]);

	const handleChange = (e) => {
		const html = e.target.value;
		setHtmlContent(html);
		if (onChange) {
			onChange(html);
		}
	};

	const executeCommand = (command, value = null) => {
		document.execCommand(command, false, value);
		if (editorRef.current) {
			editorRef.current.focus();
		}
	};

	const insertLink = () => {
		const url = window.prompt('Enter URL:');
		if (url) {
			executeCommand('createLink', url);
		}
	};

	const ToolbarButton = ({ onClick, children, title }) => (
		<button
			type="button"
			onClick={onClick}
			className="p-2 rounded hover:bg-gray-200 transition-colors"
			title={title}
		>
			{children}
		</button>
	);

	return (
		<div className={cn('rich-text-editor border border-gray-300 rounded-md bg-white', className)} ref={ref}>
			{/* Toolbar */}
			<div className="border-b border-gray-300 p-2 flex items-center gap-1 bg-gray-50 rounded-t-md flex-wrap">
				<ToolbarButton onClick={() => executeCommand('bold')} title="Bold">
					<Bold className="w-4 h-4" />
				</ToolbarButton>
				
				<ToolbarButton onClick={() => executeCommand('italic')} title="Italic">
					<Italic className="w-4 h-4" />
				</ToolbarButton>

				<ToolbarButton onClick={() => executeCommand('underline')} title="Underline">
					<span className="text-sm font-semibold">U</span>
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton onClick={() => executeCommand('formatBlock', '<h1>')} title="Heading 1">
					<Heading1 className="w-4 h-4" />
				</ToolbarButton>

				<ToolbarButton onClick={() => executeCommand('formatBlock', '<h2>')} title="Heading 2">
					<Heading2 className="w-4 h-4" />
				</ToolbarButton>

				<ToolbarButton onClick={() => executeCommand('formatBlock', '<h3>')} title="Heading 3">
					<Heading3 className="w-4 h-4" />
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">
					<List className="w-4 h-4" />
				</ToolbarButton>

				<ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbered List">
					<List className="w-4 h-4" />
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton onClick={insertLink} title="Insert Link">
					<LinkIcon className="w-4 h-4" />
				</ToolbarButton>

				<ToolbarButton onClick={() => executeCommand('unlink')} title="Remove Link">
					<span className="text-xs">Unlink</span>
				</ToolbarButton>

				<div className="flex-1" />

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setShowPreview(!showPreview)}
					className="h-8"
				>
					<Eye className="w-4 h-4 mr-1" />
					{showPreview ? 'Edit' : 'Preview'}
				</Button>
			</div>

			{/* Editor Content */}
			<div className="relative">
				{showPreview ? (
					<div
						className="min-h-[300px] p-4 prose max-w-none"
						dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-400 italic">No content to preview</p>' }}
					/>
				) : (
					<ContentEditable
						innerRef={editorRef}
						html={htmlContent}
						onChange={handleChange}
						tagName="div"
						className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
						data-placeholder={placeholder}
						{...props}
					/>
				)}
			</div>

			<style jsx global>{`
				.rich-text-editor [contenteditable]:empty:before {
					content: attr(data-placeholder);
					color: #9ca3af;
					pointer-events: none;
				}
				.rich-text-editor [contenteditable]:focus {
					outline: none;
				}
				.rich-text-editor [contenteditable] ul,
				.rich-text-editor [contenteditable] ol {
					padding-left: 1.5rem;
					margin: 0.5rem 0;
				}
				.rich-text-editor [contenteditable] h1 {
					font-size: 2rem;
					font-weight: bold;
					margin: 1rem 0;
				}
				.rich-text-editor [contenteditable] h2 {
					font-size: 1.5rem;
					font-weight: bold;
					margin: 0.75rem 0;
				}
				.rich-text-editor [contenteditable] h3 {
					font-size: 1.25rem;
					font-weight: bold;
					margin: 0.5rem 0;
				}
				.rich-text-editor [contenteditable] a {
					color: #2563eb;
					text-decoration: underline;
				}
				.rich-text-editor [contenteditable] p {
					margin: 0.5rem 0;
				}
			`}</style>
		</div>
	);
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
