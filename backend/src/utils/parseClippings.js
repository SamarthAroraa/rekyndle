//Parse My Clippings.txt file
const parseClippingsFile = (file) => {
  const clippings = [];
  const lines = file.split('\n');
  lines.forEach((line) => {
    if (line.startsWith('==========')) {
      return;
    }
    const [title, author, ...rest] = line.split('\t');
    const [start, end] = rest[0].split('-');
    const page = rest[1];
    const note = rest[2];
    clippings.push({
      title,
      author,
      start,
      end,
      page,
      note,
    });
  }).filter((line) => line !== '');
  return clippings;
}