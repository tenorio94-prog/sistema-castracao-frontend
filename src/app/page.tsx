import Link from 'next/link';

export default function Home (){

  return(

<div> 

  <h1>Pagina Home</h1>
  <Link href= "/adm">
  <p>ADM</p>
  </Link>
  
  <Link href= "/medico">
  <p>Medico</p>
  </Link>

  <Link href= "/atendente">
  <p>Atendente</p>
  </Link>

    <Link href= "/responsavel">
  <p>Responsavel</p>
  </Link>
  
</div>
  )
}