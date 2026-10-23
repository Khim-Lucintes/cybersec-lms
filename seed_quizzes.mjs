import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const units = [
  { unit: 1, title: "Overview of Cybercrime & Cyberspace", type: "interactive-scenario" },
  { unit: 2, title: "Computer Hardware & Forensic Component Disassembly", type: "hardware-disassembly" },
  { unit: 3, title: "Cybercrime Offenses & Data Privacy Act", type: "legal-scenario" },
  { unit: 4, title: "Incident Response, Preservation & Collection", type: "triage-simulator" },
  { unit: 5, title: "Digital Investigative Plan & Storage Analysis", type: "investigative-plan" },
  { unit: 6, title: "Initial Examination of Digital Evidence", type: "artifact-analysis" },
  { unit: 7, title: "Cybercrime Warrants & Judicial Issuances", type: "warrant-builder" },
  { unit: 8, title: "Environmental Laws & Wildlife Protection", type: "environmental-lab" }
];

async function seed() {
  const { data: courseData } = await supabase.from("courses").select("id").limit(1).single();
  if (!courseData) {
    console.log("No course found.");
    return;
  }

  for (const mod of units) {
    console.log("Inserting Module:", mod.title);
    
    // Check if module already exists to avoid duplicates
    const { data: existingMod } = await supabase.from("modules")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("unit_number", mod.unit)
      .single();

    let insertedMod = existingMod;

    if (!insertedMod) {
      const { data: newMod } = await supabase.from("modules").insert({
        course_id: courseData.id,
        unit_number: mod.unit,
        title: mod.title,
        period: mod.unit <= 3 ? "Prelims" : mod.unit <= 5 ? "Midterms" : "Finals",
        duration: "4 Hours",
        topics: ["Introductory Topic for " + mod.title],
        description: "Standard description for " + mod.title,
        po_mapping: ["POb"]
      }).select().single();
      insertedMod = newMod;
    }

    if (insertedMod) {
      console.log("  => Inserted/Found Module ID:", insertedMod.id);
      
      const { data: existingLab } = await supabase.from("labs").select("id").eq("module_id", insertedMod.id).single();
      if (!existingLab) {
        await supabase.from("labs").insert({
          module_id: insertedMod.id,
          title: "Lab for " + mod.title,
          lab_type: mod.type,
          instructions: "Dynamic lab instructions",
          config: { badge: "Lab Badge" }
        });
        console.log("  => Inserted Lab");
      }

      const { data: existingQuiz } = await supabase.from("quizzes").select("id").eq("module_id", insertedMod.id).single();
      if (!existingQuiz) {
        await supabase.from("quizzes").insert({
          module_id: insertedMod.id,
          title: "Quiz for " + mod.title,
          questions: [
            {
              id: `q${mod.unit}-1`,
              question: "Which of the following is true regarding " + mod.title + "?",
              options: ["It is a core cybersecurity concept", "It is unrelated to cybercrime", "It is deprecated", "It is only relevant for civil cases"],
              correctIndex: 0,
              explanation: "This is a fundamental concept taught in " + mod.title + "."
            }
          ]
        });
        console.log("  => Inserted Quiz");
      }
    }
  }
  console.log("Done");
}

seed();
