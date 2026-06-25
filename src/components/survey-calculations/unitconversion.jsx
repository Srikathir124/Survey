import React, { useState } from "react";

function UnitConversion() {


  const units = [
    "meter",
    "foot",
    "square meter",
    "square foot",
    "Acre",
    "Cent",
    "Ares",
    "Hectare"
  ];



  const lengthUnits = [
    "meter",
    "foot"
  ];


  const areaUnits = [
    "square meter",
    "square foot",
    "Acre",
    "Cent",
    "Ares",
    "Hectare"
  ];



  const factors = {


    // Length (Base = meter)

    "meter": 1,

    "foot": 0.3048,



    // Area (Base = square meter)

    "square meter": 1,

    "square foot": 0.092903,

    "Acre": 4046.8564224,

    "Cent": 40.468564224,

    "Ares": 100,

    "Hectare": 10000

  };




  const [value1, setValue1] = useState("");

  const [value2, setValue2] = useState("");


  const [unit1, setUnit1] = useState("meter");

  const [unit2, setUnit2] = useState("foot");


  const [error, setError] = useState("");





  function getType(unit){


    if(lengthUnits.includes(unit))
      return "length";


    if(areaUnits.includes(unit))
      return "area";


  }





  function convert(value, from, to){


    if(value===""){

      setError("");

      return "";

    }




    if(getType(from)!==getType(to)){


      if(getType(from)==="length"){


        setError(
          "Length unit cannot be directly converted to an Area unit"
        );


      }
      else{


        setError(
          "Area unit cannot be directly converted to a Length unit"
        );


      }



      return "";

    }





    setError("");



    let baseValue =

      Number(value) * factors[from];



    return (

      baseValue / factors[to]

    ).toFixed(4);


  }







  function firstChange(e){


    let val = e.target.value;


    setValue1(val);



    setValue2(

      convert(

        val,

        unit1,

        unit2

      )

    );


  }







  function secondChange(e){


    let val = e.target.value;


    setValue2(val);



    setValue1(

      convert(

        val,

        unit2,

        unit1

      )

    );


  }







  function firstUnitChange(e){


    let newUnit = e.target.value;


    setUnit1(newUnit);



    setValue2(

      convert(

        value1,

        newUnit,

        unit2

      )

    );


  }







  function secondUnitChange(e){


    let newUnit = e.target.value;


    setUnit2(newUnit);



    setValue2(

      convert(

        value1,

        unit1,

        newUnit

      )

    );


  }







  function swapUnits(){


    setUnit1(unit2);

    setUnit2(unit1);



    setValue1(value2);

    setValue2(value1);


  }








  return (


    <div className="conversion-page">



      <div className="conversion-card">



        <h2>
          📐 Unit Conversion
        </h2>



        <p className="subtitle">
          Convert length and area units instantly
        </p>






        <div className="converter-box">





          <div className="input-group">



            <input

              type="number"

              placeholder="Enter value"

              value={value1}

              onChange={firstChange}

            />



            <select

              value={unit1}

              onChange={firstUnitChange}

            >


            {

              units.map(u =>


                <option key={u}>

                  {u}

                </option>


              )

            }


            </select>



          </div>







          <button

            className="swap"

            onClick={swapUnits}

          >

            ⇄

          </button>







          <div className="input-group">



            <input

              type="text"

              placeholder="Result"

              value={value2}

              onChange={secondChange}

            />



            <select

              value={unit2}

              onChange={secondUnitChange}

            >


            {

              units.map(u =>


                <option key={u}>

                  {u}

                </option>


              )

            }


            </select>



          </div>






        </div>






        {

          error &&


          <div

          style={{

            color:"red",

            textAlign:"center",

            marginTop:"20px",

            fontSize:"15px",

            fontWeight:"600"

          }}

          >

            {error}


          </div>


        }






      </div>









      <style>{`



      .conversion-page{


        min-height:80vh;

        display:flex;

        justify-content:center;

        align-items:center;

        background:#f5f7fb;

        padding:20px;


      }






      .conversion-card{


        background:white;

        width:600px;

        padding:35px;

        border-radius:18px;

        box-shadow:

        0 8px 25px rgba(0,0,0,.12);


      }







      h2{


        text-align:center;

        margin-bottom:8px;

        color:#1f2937;


      }






      .subtitle{


        text-align:center;

        color:#6b7280;

        margin-bottom:30px;


      }







      .converter-box{


        display:flex;

        align-items:center;

        justify-content:center;

        gap:20px;


      }






      .input-group{


        display:flex;

        flex-direction:column;

        gap:12px;


      }






      input,select{


        width:200px;

        padding:13px;

        font-size:16px;

        border-radius:10px;

        border:1px solid #d1d5db;

        outline:none;


      }






      input:focus,

      select:focus{


        border-color:#2563eb;


      }






      input{


        background:#f9fafb;


      }






      .swap{


        width:45px;

        height:45px;

        border-radius:50%;

        border:none;

        background:#2563eb;

        color:white;

        font-size:25px;

        cursor:pointer;


      }






      .swap:hover{


        background:#1d4ed8;


      }







      @media(max-width:600px){



        .converter-box{


          flex-direction:column;


        }




        .swap{


          transform:rotate(90deg);


        }



      }




      `}</style>






    </div>


  );

}



export default UnitConversion;