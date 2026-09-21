const fieldIds = [
  'appName',
  'bundleId',
  'version',
  'platform',
  'minimumOs',
  'ipaFile',
  'fileSize',
  'appBundlePath',
  'archiveType',
];

const previewElements = {
  previewName: document.getElementById('previewName'),
  previewBundleId: document.getElementById('previewBundleId'),
  previewVersion: document.getElementById('previewVersion'),
  previewPlatform: document.getElementById('previewPlatform'),
  previewMinimumOs: document.getElementById('previewMinimumOs'),
  previewIpaFile: document.getElementById('previewIpaFile'),
  previewFileSize: document.getElementById('previewFileSize'),
  previewAppBundlePath: document.getElementById('previewAppBundlePath'),
  previewArchiveType: document.getElementById('previewArchiveType'),
};

const statusMessage = document.getElementById('statusMessage');
const createIpaBtn = document.getElementById('createIpaBtn');
const downloadIpaBtn = document.getElementById('downloadIpaBtn');

let generatedBlob = null;
let generatedFileName = 'app.ipa';

const fallbackValue = 'Paste here';

function sanitizeInput(value) {
  return (value || '').trim();
}

function getAppData() {
  return fieldIds.reduce((acc, id) => {
    acc[id] = sanitizeInput(document.getElementById(id).value);
    return acc;
  }, {});
}

function getDisplayValue(value, fallback = fallbackValue) {
  return value || fallback;
}

function renderPreview() {
  const appData = getAppData();

  previewElements.previewName.textContent = getDisplayValue(appData.appName, 'App Name');
  previewElements.previewBundleId.textContent = getDisplayValue(appData.bundleId);
  previewElements.previewVersion.textContent = getDisplayValue(appData.version);
  previewElements.previewPlatform.textContent = getDisplayValue(appData.platform);
  previewElements.previewMinimumOs.textContent = getDisplayValue(appData.minimumOs);
  previewElements.previewIpaFile.textContent = getDisplayValue(appData.ipaFile);
  previewElements.previewFileSize.textContent = getDisplayValue(appData.fileSize);
  previewElements.previewAppBundlePath.textContent = getDisplayValue(appData.appBundlePath);
  previewElements.previewArchiveType.textContent = getDisplayValue(appData.archiveType);
}

function createIpaPayload(appData) {
  return {
    appName: appData.appName || 'App Name',
    bundleId: appData.bundleId || 'com.example.app',
    version: appData.version || '1.0',
    platform: appData.platform || 'iOS',
    minimumOS: appData.minimumOs || '15.0',
    ipaFile: appData.ipaFile || 'AppName.ipa',
    fileSize: appData.fileSize || '0 KB',
    appBundlePath: appData.appBundlePath || 'Payload/AppName.app',
    archiveType: appData.archiveType || 'Ad Hoc',
    createdAt: new Date().toISOString(),
  };
}

function buildIpaFile() {
  const appData = getAppData();
  const payload = createIpaPayload(appData);

  const fileName = (appData.appName || 'app').trim().replace(/\s+/g, ' ') || 'app';
  generatedFileName = `${fileName.replace(/[^a-zA-Z0-9._-]+/g, '-')}.ipa`;

  const content = [
    'PKG-INFO',
    'Archive-Type: ' + payload.archiveType,
    'App-Name: ' + payload.appName,
    'Bundle-ID: ' + payload.bundleId,
    'Version: ' + payload.version,
    'Platform: ' + payload.platform,
    'Minimum-OS: ' + payload.minimumOS,
    'IPA-File: ' + payload.ipaFile,
    'File-Size: ' + payload.fileSize,
    'App-Bundle-Path: ' + payload.appBundlePath,
    'Created-At: ' + payload.createdAt,
    '',
    'This is a generated placeholder IPA package for App Store archive preview.',
  ].join('\n');

  generatedBlob = new Blob([content], { type: 'application/octet-stream' });
  return generatedBlob;
}

function handleCreateIpa() {
  const appData = getAppData();
  const hasDetails = Object.values(appData).some((value) => value.length > 0);

  if (!hasDetails) {
    statusMessage.textContent = 'Add at least one app detail before creating the IPA package.';
    statusMessage.style.color = '#b7791f';
    return;
  }

  buildIpaFile();
  downloadIpaBtn.disabled = false;
  statusMessage.textContent = 'IPA package created successfully.';
  statusMessage.style.color = '#198754';
}

function handleDownloadIpa() {
  if (!generatedBlob) {
    statusMessage.textContent = 'Create the IPA package before downloading it.';
    statusMessage.style.color = '#b7791f';
    return;
  }

  const url = URL.createObjectURL(generatedBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generatedFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  statusMessage.textContent = 'IPA download started.';
  statusMessage.style.color = '#198754';
}

fieldIds.forEach((fieldId) => {
  document.getElementById(fieldId).addEventListener('input', renderPreview);
});

createIpaBtn.addEventListener('click', handleCreateIpa);
downloadIpaBtn.addEventListener('click', handleDownloadIpa);

renderPreview();
