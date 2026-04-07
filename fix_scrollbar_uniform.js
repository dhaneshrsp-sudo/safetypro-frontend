const fs = require('fs');

const UNIFORM_SCROLLBAR = `<style>
/* sp-scrollbar-uniform */
.content, .main-area, .ai-scroll, .hrm-scroll, .field-scroll, .docs-scroll, .auditor-scroll,
#ai-tab-insights, #ai-tab-patterns, #ai-tab-predict {
  scrollbar-width: thin !important;
  scrollbar-color: var(--border) transparent !important;
}
.content::-webkit-scrollbar, .main-area::-webkit-scrollbar,
.ai-scroll::-webkit-scrollbar, .hrm-scroll::-webkit-scrollbar,
.field-scroll::-webkit-scrollbar, .docs-scroll::-webkit-scrollbar,
#ai-tab-insights::-webkit-scrollbar, #ai-tab-patterns::-webkit-scrollbar,
#ai-tab-predict::-webkit-scrollbar {
  width: 6px !important;
}
.content::-webkit-scrollbar-track, .main-area::-webkit-scrollbar-track,
.ai-scroll::-webkit-scrollbar-track, .hrm-scroll::-webkit-scrollbar-track,
.field-scroll::-webkit-scrollbar-track, .docs-scroll::-webkit-scrollbar-track,
#ai-tab-insights::-webkit-scrollbar-track, #ai-tab-patterns::-webkit-scrollbar-track,
#ai-tab-predict::-webkit-scrollbar-track {
  background: transparent !important;
}
.content::-webkit-scrollbar-thumb, .main-area::-webkit-scrollbar-thumb,
.ai-scroll::-webkit-scrollbar-thumb, .hrm-scroll::-webkit-scrollbar-thumb,
.field-scroll::-webkit-scrollbar-thumb, .docs-scroll::-webkit-scrollbar-thumb,
#ai-tab-insights::-webkit-scrollbar-thumb, #ai-tab-patterns::-webkit-scrollbar-thumb,
#ai-tab-predict::-webkit-scrollbar-thumb {
  background: var(--border) !important;
  border-radius: 3px !important;
}
</style>`;

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

FILES.forEach(f => {
  if(!fs.existsSync(f)){ console.log('SKIP:', f); return; }
  let h = fs.readFileSync(f,'utf8');
  if(h.includes('sp-scrollbar-uniform')){ console.log('ALREADY DONE:', f); return; }
  // Remove any old scrollbar CSS patches to avoid conflicts
  h = h.replace(/<style>[^<]*(?:scrollbar-color:#475569|ai-always-scrollbar|ai-native-scrollbar|ai-scrollbar-visible)[^<]*<\/style>\s*/g, '');
  h = h.replace('</head>', UNIFORM_SCROLLBAR + '\n</head>');
  fs.writeFileSync(f, h, 'utf8');
  console.log('PATCHED:', f);
});
