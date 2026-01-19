import Note from "../Models/note.js";

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find().sort({createdAt : -1}); // newest first
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in GetallNotes controller", error);

    res.status(500).json({ message: "internal server error" });
  }
}

export async function getNotesById(req,res) {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({message:"Note not found!"})
    res.json(note)
  } catch (error) {
    console.error("Error in getallnotes controller", error);
    res.status(500).json({message:"internal server error"})
  }
}

export async function createNote(req, res) {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content });

    await newNote.save();
    res.status(201).json({ message: "Note created sucessfully" });
  } catch (error) {
    console.error("Error in create note controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { title, content },{new:true});

    if (!updatedNote) return res.status(404).json({message:"Note not found"})

    res.status(200).json({ message: "Note updated sucessfully" });
  } catch (error) {
    console.error("error in NoteUpdate controller");
    res.status(500).json({ message: "internal server error" });
  }
}

export async function deleteNote(req, res) {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if(!deletedNote) return res.status(404).json({message:"Note not found"})

    res.status(200).json({ message: "Note deleted sucessfully" });
  } catch (error) {
    console.error("Error in deleteNote controller");
    res.status(500).json({ message: "internal server error" });
  }
}
