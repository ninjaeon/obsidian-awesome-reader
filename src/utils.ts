import {App, loadPdfJs, TFile, WorkspaceLeaf} from "obsidian";

export async function openOrCreateNote(app: App, file: TFile, toc: string) {
	const noteFilename = `${file.parent ? file.parent.path : ''}/${file.basename}.md`;
	try {
		const noteFile = await app.vault.create(
			noteFilename,
			`---\nbookname: "${file.basename}.${file.extension}"\n---\n\n` + toc
		);
		const leaf = app.workspace.getLeaf(true);
		await leaf.openFile(noteFile, {active: true});
	} catch (e) {
		if (e.message.includes("File already exists")) {
			const noteFile = app.vault.getAbstractFileByPath(noteFilename);
			const leaf = app.workspace.getLeaf(true);
			await leaf.openFile(noteFile as TFile, {active: true});
		} else {
			console.error(e);
		}
	}
}

export function getEpubTocMd(rawToc: any) {
	function dfs(node: { label: string; subitems: any; }, output: any[], depth: number) {
		if (!node) return;
		const cleanedLabel = node.label.replace(/\u0000/g, '').trim();
		output.push("#".repeat(depth) + " " + cleanedLabel);
		for (let sub of node.subitems) {
			dfs(sub, output, depth + 1);
		}
	}

	if (!rawToc) return "";
	const output: any[] = [];
	for (let sub of rawToc) {
		dfs(sub, output, 1);
	}
	return output.join("\n\n");
}

export async function getPdfTocMd(file: TFile) {
	const pdfjsLib = await loadPdfJs();
	const content = await this.app.vault.readBinary(file);
	const pdf = await pdfjsLib.getDocument(new Uint8Array(content)).promise;
	const rawToc = await pdf.getOutline();

	function dfs(node: { title: string; items: any; }, output: any[], depth: number) {
		if (!node) return;
		const cleanedLabel = node.title.replace(/\u0000/g, '').trim();
		output.push("#".repeat(depth) + " " + cleanedLabel);
		for (let sub of node.items) {
			dfs(sub, output, depth + 1);
		}
	}

	if (!rawToc) return "";
	const output: any[] = [];
	for (let sub of rawToc) {
		dfs(sub, output, 1);
	}
	return output.join("\n\n");
}
