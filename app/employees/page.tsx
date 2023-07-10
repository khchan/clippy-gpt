import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
  import { cookies } from "next/headers";

  export default async function Index() {
    const supabase = createServerComponentClient({ cookies });

    const { data: employees } = await supabase.from("employees").select();

    return (
        <div>
            <h1>Hello There!</h1>
            <ul className="my-auto">
                {employees?.map((e) => (
                <li key={e.id}>{e.name}</li>
                ))}
            </ul>
        </div>
    );
  }