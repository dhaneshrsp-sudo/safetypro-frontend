const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Inject targeted CSS fix into the existing </style> tag
const CSS = `
  /* ── Legal & Regulatory tab scroll fix ── */
  #ac-legal {
    display: block !important;
    overflow-y: scroll !important;
    overflow-x: auto !important;
    height: 100% !important;
    scrollbar-width: thin !important;
    scrollbar-color: var(--border) transparent !important;
  }
  #ac-legal::-webkit-scrollbar { width: 6px; }
  #ac-legal::-webkit-scrollbar-track { background: transparent; }
  #ac-legal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  #ac-legal > .card {
    overflow: visible !important;
    flex-shrink: 0 !important;
    height: auto !important;
  }
  #ac-legal > .card > div {
    overflow-x: auto !important;
    overflow-y: visible !important;
    height: auto !important;
    width: 100% !important;
  }
  #ror-stats {
    display: grid !important;
    grid-template-columns: repeat(5,1fr) !important;
  }
  #ror-table {
    min-width: 880px !important;
  }`;

// Insert before last </style> 
const lastStyle = h.lastIndexOf('</style>');
h = h.substring(0, lastStyle) + CSS + '\n' + h.substring(lastStyle);

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('CSS injected. Size:', Math.round(h.length/1024)+'KB');
