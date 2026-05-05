import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { NextResponse } from "next/server"

const TEMPLATE_CSV = `stem;alt_a;alt_b;alt_c;alt_d;alt_e;correct;subject;content;source;year;commentary
"Nos termos da **CF/88**, são Poderes da União, *independentes* e harmônicos entre si:";"Legislativo, Executivo e Judiciário";"Legislativo, Executivo e Ministerial";"Judiciário, Executivo e Eleitoral";"Legislativo, Ministerial e Judiciário";"";A;"Direito Constitucional";"Organização do Estado";"CESPE 2023";2023;"Os Poderes da União estão definidos no **art. 2º** da CF/88."
"A prescrição intercorrente no processo civil:";"suspende o prazo prescricional";"reinicia o prazo prescricional";"~~extingue o processo após 1 ano de inércia~~";"não se aplica ao processo civil";"";C;"Direito Processual Civil";"Prescrição";"FGV 2024";2024;""
`

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return new NextResponse(TEMPLATE_CSV, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="template-questoes.csv"',
        },
    })
}
