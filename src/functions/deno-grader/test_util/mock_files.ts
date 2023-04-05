interface MockFileEntry {
  content: Uint8Array;
  type: string;
  name: string;
  filename: string;
}

const getNumberOfFilesInFormData = (n: number) => {
  const file : MockFileEntry = getFile("text");

  const form = new FormData();
  for (let i = 0; i < n; i++) {
    form.append(
      file.name,
      new Blob([file.content], { type: file.type }),
      file.filename,
    );
  }

  return form;
};

const getFormData = (name: string) => {
  const files : MockFileEntry[] = getFiles();
  const limitedFiles : MockFileEntry[] = files.filter((file) => file.name === name);
  const file : MockFileEntry = limitedFiles[0] as unknown as MockFileEntry;

  const form : FormData = new FormData();
  form.append(
    file.name,
    new Blob([file.content], { type: file.type }),
    file.filename,
  );

  return form;
};

const createFormData = async (file: MockFileEntry) => {
  const form : FormData = new FormData();

  const blob : Blob = new Blob([file.content], { type: file.type });

  form.append(
    file.name,
    blob,
    file.filename,
  );

  return form;
};


const getFile = (name: String) : MockFileEntry => {
  const files : MockFileEntry[] = getFiles();
  const limitedFiles : MockFileEntry[] = files.filter((file) => file.name === name);
  const file : MockFileEntry = limitedFiles[0] as unknown as MockFileEntry;

  return file;
};

const getFiles = () : MockFileEntry[] => {
  const files : MockFileEntry[] = [
    {
      content: new Uint8Array([
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
        0,
        0,
        0,
        13,
        73,
        72,
        68,
        82,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        8,
        2,
        0,
        0,
        0,
        144,
        119,
        83,
        222,
        0,
        0,
        0,
        12,
        73,
        68,
        65,
        84,
        8,
        215,
        99,
        248,
        255,
        255,
        63,
        0,
        5,
        254,
        2,
        254,
        220,
        204,
        89,
        231,
        0,
        0,
        0,
        0,
        73,
        69,
        78,
        68,
        174,
        66,
        96,
        130,
      ]),
      type: "image/png",
      name: "image",
      filename: "white-pixel.png",
    },
    {
      content: new Uint8Array([
        108,
        2,
        0,
        0,
        145,
        22,
        162,
        61,
        157,
        227,
        166,
        77,
        138,
        75,
        180,
        56,
        119,
        188,
        177,
        183,
      ]),
      name: "file",
      filename: "file.bin",
      type: "application/octet-stream",
    },
    {
      content: new TextEncoder().encode("hello world"),
      type: "text/plain",
      name: "text",
      filename: "hello.txt",
    },
  ];

  return files;
};

export { getNumberOfFilesInFormData, getFormData, createFormData, getFiles, getFile };
