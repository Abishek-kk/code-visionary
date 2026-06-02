exports.extractJSON = (text) => {
  try { return JSON.parse(text); } catch (e) { return null; }
};
