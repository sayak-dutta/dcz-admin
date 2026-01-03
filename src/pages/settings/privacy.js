import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAdminAppContent } from '@/hooks/useAdminAppContent';
import { Loader2, Save, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function PrivacyPolicyEditor() {
	const [content, setContent] = useState('');
	const [originalContent, setOriginalContent] = useState('');
	const [showPreview, setShowPreview] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const { loading, error, getPrivacyPolicy, updatePrivacyPolicy } = useAdminAppContent();

	useEffect(() => {
		loadPrivacyPolicy();
	}, []);

	const loadPrivacyPolicy = async () => {
		const result = await getPrivacyPolicy();
		if (result.success) {
			const loadedContent = result.data?.data?.content || result.data?.content || '';
			setContent(loadedContent);
			setOriginalContent(loadedContent);
			setIsDirty(false);
		}
	};

	const handleContentChange = (newContent) => {
		setContent(newContent);
		setIsDirty(newContent !== originalContent);
	};

	const handleSave = async () => {
		if (!content || content.trim() === '' || content === '<p><br></p>') {
			alert('Please enter some content before saving');
			return;
		}

		const result = await updatePrivacyPolicy(content);
		if (result.success) {
			setOriginalContent(content);
			setIsDirty(false);
			alert('Privacy policy updated successfully!');
		} else {
			alert(result.error || 'Failed to update privacy policy');
		}
	};

	return (
		<Layout title="Privacy Policy">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<p className="text-muted-foreground">
						Edit the privacy policy content using the rich text editor below
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setShowPreview(true)}
							disabled={loading}
						>
							<Eye className="w-4 h-4 mr-2" />
							Preview
						</Button>
						<Button
							onClick={handleSave}
							disabled={loading || !isDirty}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
						Error: {error}
					</div>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Privacy Policy Content</CardTitle>
					</CardHeader>
					<CardContent>
						{loading && !content ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin mr-2" />
								Loading privacy policy...
							</div>
						) : (
							<RichTextEditor
								value={content}
								onChange={handleContentChange}
								placeholder="Enter privacy policy content..."
							/>
						)}
						{isDirty && (
							<p className="text-sm text-orange-600 mt-2">
								You have unsaved changes. Don't forget to save!
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Preview Modal */}
			<Modal
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
				title="Privacy Policy Preview"
				size="xl"
			>
				<div
					className="prose max-w-none"
					dangerouslySetInnerHTML={{ __html: content || '<p>No content to preview</p>' }}
				/>
			</Modal>
		</Layout>
	);
}

