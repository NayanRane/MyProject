var somethingChanged = false;
var somethingChangedForModel = false;
var somethingChangedForModelTab = false;
const form = document.getElementById("mileage_reimbursement_create_form");
const forms = document.getElementById("formProcess");
var mileageClaimsArray = [];
let amountArray = [];
const tableBody = document.querySelector("#mileage_create_table tbody");
let mileageRate = null;
// MileageApiController
const isExitMileageRateAPI = (date) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `${Host_URL}/api/Mileage/GetMileageRateOnDate?date=${date}`,
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: document.getElementById("RequestVerificationToken").value,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (response) => {
                if (response !== -1) {
                    mileageRate = response;
                    recalculateAmount();
                    resolve(true);
                } else {
                    Swal.fire({
                        title: `Mileage Rate doesn't exist! Please contact the system administrator.`,
                        icon: 'error',
                        confirmButtonText: "Ok",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        customClass: {
                            confirmButton: "btn button-base text-white me-1",
                        },
                        buttonsStyling: false
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            $("#mileageClaimDate").val('');
                            $("#AddDataModal").modal("hide");
                            mileageRate = null;
                        }
                        resolve(false); // still resolve to allow flow
                    });
                }
            },
            error: (xhr, status, error) => {
                console.error("Error fetching mileage rate:", error);
                reject(error);
            },
        });
    });
};



$(document).ready(function () {
    checkDuplicateValue(alertMessage);

    $("table").removeClass("table-hover");
    if (MileageList !== null) {
        mileageClaimsArray = MileageList
        if (mileageClaimsArray.length != 0) {
            $.each(mileageClaimsArray, function (key, item) {
                const returnList = formatCompanyList(item.CompanyList);
                item.CompanyCode = returnList.CompanyCode;
                item.CompanyName = returnList.CompanyName;
                item.ClusterCode = returnList.ClusterCode;
                item.ClusterName = returnList.ClusterName;
                item.ProjectCode = returnList.ProjectCode;
                item.ProjectName = returnList.ProjectName;
            });
            $(".headerDate").addClass("pe-none");
            $(".disabled_button").change();
        } else {
            $(".headerDate").removeClass("pe-none");
        }
    }

    $("#Project").multiselectsplitter({
        selectSize: 1,
        clearOnFirstChange: true,
        groupCounter: true,
    });
    $("#Approver1Id").on("change", function () {
        if ($(this).val() !== "") {
            $("#Approver1Name").val($("#Approver1Id option:selected").text());
        }
    });
    $("#Approver2Id").on("change", function () {
        if ($(this).val() !== "") {
            $("#Approver2Name").val($("#Approver2Id option:selected").text());
        }
    });

    if (MileageList !== null) {
        $("#FromDate").val(returnFromDate)
        $("#todate").val(returnToDate)
    }


    $("#myDiv input, #myDiv select, #myDiv textarea").change(function () {
        somethingChanged = true;
    });

    $("#model_MainDetails input, #model_MainDetails select, #model_MainDetails textarea").change(
        function () {
            somethingChangedForModel = true;
        }
    );

    $("#kt_tab_pane_2 input, #kt_tab_pane_2 select, #kt_tab_pane_2 textarea").change(function () {
        somethingChangedForModelTab = true;
    });

    $("#kt_tab_pane_1 input, #kt_tab_pane_1 select, #kt_tab_pane_1 textarea").change(function () {
        somethingChangedForModelTab = true;
    });


    $("#FromDate").flatpickr({
        allowInput: true,
        altInput: true,
        altFormat: "m-d-Y",
        dateFormat: "Y-m-d",
        maxDate: new Date(),
        minDate: "2025-01-01",//Added by AS on 30-05-25
        onChange: function (sel_date, date_str) {
            end_date.set("minDate", date_str);
            model_date.set("minDate", date_str);
            const selectedDate = sel_date[0];
            const maxDate = new Date().fp_incr(-90);
            if (selectedDate < maxDate) {
                Swal.fire({
                    title: `Please ensure you submit Mileage on timely basis!`,
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok",
                    customClass: {
                        confirmButton: "btn btn-dark",
                    },
                });
            }
        }
    });

    const end_date = flatpickr("#Todate", {
        allowInput: true,
        altInput: true,
        altFormat: "m-d-Y",
        dateFormat: "Y-m-d",
        minDate: "2025-01-01",//Added by AS on 30-05-25
        maxDate: new Date(),
        onChange: function (sel_date, date_str) {
            model_date.set("maxDate", date_str);
        },
    });

    const model_date = $("#mileageClaimDate").flatpickr({
        allowInput: true,
        altInput: true,
        altFormat: "m-d-Y",
        dateFormat: "Y-m-d",
        maxDate: $("#Todate").val(),
        minDate: $("#FromDate").val(),
        onClose: function (sel_date, date_str, instance) {
            if (date_str !== "") {
                isExitMileageRateAPI(date_str);
            }else{
                mileageRate = null;
                $("#actualMileidAmount").html("0.00");
            }
        }
    });

    $("#AddDataModal").modal({
        backdrop: "static",
        keyboard: false,
        focus: false,
    });

    mileageClaimsTable();

    const formElement = document.getElementsByClassName('mileage_reimbursement_createpage');
    for (let i = 0; i < formElement.length; i++) {
        addHoverInfoSpans(formElement[i]);
    }
});

function formatCompanyList(companyList) {
    const result = companyList;
    const reversedResult = {
        CompanyCode: [],
        CompanyName: [],
        ClusterCode: [],
        ClusterName: [],
        ProjectCode: [],
        ProjectName: []
    };

    result.forEach((companys, companyIndex) => {
        // Add CompanyCode as an array for each company
        if (companys.CompanyCode) {
            reversedResult.CompanyCode.push(companys.CompanyCode);
        } else {
            reversedResult.CompanyCode.push("");
        }

        // Add CompanyName as an array for each company
        if (companys.CompanyName) {
            reversedResult.CompanyName.push(companys.CompanyName);
        } else {
            reversedResult.CompanyName.push("");
        }
        let parentCompanyCode = companys.CompanyCode;
        // Now loop through the clusters for this company
        if (companys.ClusterList && companys.ClusterList.length > 0) {
            companys.ClusterList.forEach((clusters, clusterindex) => {
                var index = reversedResult.CompanyCode.findIndex(code => code === parentCompanyCode);
                let parentClusterCode = clusters.ClusterCode;
                if (reversedResult.ClusterCode.length !== 0) {
                    if (reversedResult.ClusterCode[index] !== undefined) {
                        reversedResult.ClusterCode[index] = [...reversedResult.ClusterCode[index], [clusters.ClusterCode]];
                        reversedResult.ClusterName[index] = [...reversedResult.ClusterName[index], [clusters.ClusterName]];
                    } else {
                        reversedResult.ClusterCode.push([[clusters.ClusterCode]]);
                        reversedResult.ClusterName.push([[clusters.ClusterName]]);
                    }
                } else {
                    reversedResult.ClusterCode.push([[clusters.ClusterCode]]);
                    reversedResult.ClusterName.push([[clusters.ClusterName]]);
                }

                // Initialize arrays to hold project data for this cluster
                const projectCodes = [];
                const projectNames = [];

                if (Array.isArray(clusters.ProjectList) && clusters.ProjectList.length > 0) {
                    clusters.ProjectList.forEach(projects => {
                        if (projects.ProjectCode && projects.ProjectName) {
                            projectCodes.push(projects.ProjectCode);
                            projectNames.push(projects.ProjectName);
                        }
                    });
                }

                // Push project data to reversedResult
                if (reversedResult.ProjectCode.length !== 0) {
                    let clusterCount = reversedResult.ClusterCode[companyIndex][clusterindex].findIndex(
                        x => x === parentClusterCode
                    );

                    if (clusterCount !== -1) {
                        if (reversedResult.ProjectCode[companyIndex] !== undefined) {
                            reversedResult.ProjectCode[companyIndex] = [
                                ...reversedResult.ProjectCode[companyIndex],
                                [...projectCodes]
                            ];
                            reversedResult.ProjectName[companyIndex] = [
                                ...reversedResult.ProjectName[companyIndex],
                                [...projectNames]
                            ];
                        } else {
                            reversedResult.ProjectCode.push([projectCodes]);
                            reversedResult.ProjectName.push([projectNames]);
                        }
                    }
                } else {
                    reversedResult.ProjectCode.push([projectCodes]);
                    reversedResult.ProjectName.push([projectNames]);
                }
            });
        } else {
            // Handle case where ClusterList is empty
            reversedResult.ClusterCode.push([[]]);
            reversedResult.ClusterName.push([[]]);
            reversedResult.ProjectCode.push([[]]);
            reversedResult.ProjectName.push([[]]);
        }
    });


    return reversedResult;

}


function formatDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
}


var validator = FormValidation.formValidation(
    forms,
    {
        fields: {
            MileageHeader: {
                validators: {
                    notEmpty: {
                        message: "Please enter Mileage Header",
                    },
                    stringLength: {
                        min: 3,
                        max: 200,
                        message: 'Mileage Header must be within 3 to 200 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/'",-.@:?$%]+)?$/,
                        message: `The Mileage Header can consist of alphanumeric characters only and ( ) , . / ' : & % $ @ - ? " after some input`,
                    }
                },
            },
            MileageFromDate: {
                validators: {
                    notEmpty: {
                        message: "Please select Mileage From Date",
                    },
                    regexp: {
                        regexp: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                        message: `Mileage From Date not in a valid format.`,
                    }
                },
            },
            MileageToDate: {
                validators: {
                    notEmpty: {
                        message: "Please select Mileage To Date",
                    },
                    regexp: {
                        regexp: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                        message: `Mileage To Date not in a valid format.`,
                    }
                },
            },
            MileageDescription: {
                validators: {
                    notEmpty: {
                        message: "Please enter Mileage Description",
                    },
                    stringLength: {
                        min: 4,
                        max: 350,
                        message: 'Mileage Description must be within 4 to 350 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/'",-.@:?$%]+)?$/,
                        message: `The Mileage Description can consist of alphanumeric characters only and ( ) , . / ' : & % $ @ - ? " after some input`,
                    }
                },
            },
            Approver1Id: {
                validators: {
                    notEmpty: {
                        message: "Please select Approver 1",
                    },
                },
            },
        },

        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: '.mileage_validation',
                eleInvalidClass: '',
                eleValidClass: ''
            })
        }

    }
);

const submitButton1 = document.getElementById('btn_process');
submitButton1.addEventListener('click', function (e) {
    e.preventDefault();
    if (validator) {
        validator.validate().then(function (status) {
            if (
                status == "Valid" &&
                tableBody.rows.length != 0 &&
                tableBody.rows[0].innerText != "No data available in table"
            ) {
                loader.classList.remove("d-none");
                submitButton1.setAttribute("data-kt-indicator", "on");
                forms.submit();
            } else {
                e.preventDefault();
                if (status == "Valid") {
                    Swal.fire({
                        title: "Enter expense details in table before saving draft..",
                        icon: "warning",
                        customClass: {
                            confirmButton: "btn button-base text-white me-1",
                        },
                        allowOutsideClick: false,
                        buttonsStyling: false,
                    });
                }
            }
        });
    }
});

const submitButton2 = document.getElementById('btn_drafts');
submitButton2.addEventListener('click', function (e) {
    e.preventDefault();
    if (validator) {
        validator.validate().then(function (status) {
            if (
                status == "Valid" &&
                tableBody.rows.length != 0 &&
                tableBody.rows[0].innerText != "No data available in table"
            ) {
                loader.classList.remove("d-none");
                submitButton2.setAttribute("data-kt-indicator", "on");
                forms.action = `${Host_URL}/Mileages/SaveAsDraft`;
                forms.submit();
            } else {
                e.preventDefault();
                if (status == "Valid") {
                    Swal.fire({
                        title: "Enter expense details in table before saving draft..",
                        icon: "warning",
                        customClass: {
                            confirmButton: "btn button-base text-white me-1",
                        },
                        allowOutsideClick: false,
                        buttonsStyling: false,
                    });
                }
            }
        });
    }
});



$(".disabled_button").on("change", function (event) {
    var AllFieldSelected = true;
    $.each($(".disabled_button"), function (i, obj) {
        if (obj.value == "" || obj.value == " " || obj.value == null) {
            AllFieldSelected = false;
            return;
        }
    });
    AllFieldSelected == true
        ? $("#btndisable").removeClass("disabled") &&
        $("#btndisable").attr("tabindex", "0")
        : $("#btndisable").addClass("disabled") &&
        $("#btndisable").attr("tabindex", "-1");
});


const CompanyNotEmpty = function () {
    return {
        validate: function () {
            const projectField = $("#ProjectLabel");
            var cluster = $('#cluster option:selected');
            if ($('#toggleBtn').is(':checked', true)) {
                if (multipleEnitiesArr.length != 0) {
                    return {
                        valid: true,
                    };
                }
                else {
                    if ($("#company").val() == "") {
                        return {
                            valid: false,
                            message: "Please select Company",
                        };
                    } else {
                        $("#addEntities").focus();
                        return {
                            valid: true,
                        };
                    }
                }
            } else {
                if ($("#company").val() == "") {
                    return {
                        valid: false,
                        message: "Please select Company",
                    };
                }
                else
                    return {
                        valid: true,
                    }
            }
        },
    };
};
const form2 = document.getElementById("mileage_reimbursement_create_form");
FormValidation.validators.CompanyNotEmpty = CompanyNotEmpty;
var validator2 = FormValidation.formValidation(
    form2,
    {
        fields: {
            MileageDate: {
                validators: {
                    notEmpty: {
                        message: "Please select Mileage Date",
                    },
                    regexp: {
                        regexp: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                        message: `Mileage Date not in a valid format.`,
                    }
                },
            },
            Company: {
                validators: {
                    CompanyNotEmpty: {
                        message: "Please select Company",
                    },
                },
            },
            ModelDescription: {
                validators: {
                    notEmpty: {
                        message: "Please enter Mileage Description",
                    },
                    stringLength: {
                        min: 3,
                        max: 200,
                        message: 'Mileage Description must be within 3 to 200 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/'",-.@:?$%]+)?$/,
                        message: `The Mileage Description can consist of alphanumeric characters only and ( ) , . / ' : & % $ @ - ? " after some input`,
                    }
                },
            },
            Mileage: {
                validators: {
                    stringLength: {
                        min: 1,
                        max: 7,
                        message: 'Mileage must be within 1 to 7 characters'
                    },
                    regexp: {
                        regexp: /^\d+(\.\d{1,2})?$/,
                        message: `The Miles can consist of numeric value only and . after some input`,
                    },
                    callback: {
                        message: "Please enter Miles",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "mileage") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
            ActualMile: {
                validators: {
                    stringLength: {
                        min: 1,
                        max: 7,
                        message: 'Actual Mileage must be within 1 to 7 characters'
                    },
                    regexp: {
                        regexp: /^\d+(\.\d{1,2})?$/,
                        message: `The Actual Mileage can consist of numeric value only and . after some input`,
                    },
                    callback: {
                        message: "Please enter Actual Mileage",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "map") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
            StartLocation: {
                validators: {
                    stringLength: {
                        min: 5,
                        max: 250,
                        message: 'Start Location must be within 5 to 250 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/',-.:#]+)?$/,
                        message: `The Start Location can consist of alphanumeric characters only and ( ) , . / ' : & - # after some input`,
                    },
                    callback: {
                        message: "Please enter Start Location",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "mileage") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
            EndLocation: {
                validators: {
                    stringLength: {
                        min: 5,
                        max: 250,
                        message: 'End Location must be within 5 to 250 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/',-.:#]+)?$/,
                        message: `The End Location can consist of alphanumeric characters only and ( ) , . / ' : & - # after some input`,
                    },
                    callback: {
                        message: "Please enter End Location",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "mileage") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
            MapFrom: {
                validators: {
                    stringLength: {
                        min: 5,
                        max: 150,
                        message: 'Start Location must be within 5 to 150 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/',-.:#]+)?$/,
                        message: `The Start Location can consist of alphanumeric characters only and ( ) , . / ' : & - # after some input`,
                    },
                    callback: {
                        message: "Please enter Start Location",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "map") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
            MapTo: {
                validators: {
                    stringLength: {
                        min: 5,
                        max: 150,
                        message: 'End Location must be within 5 to 150 characters'
                    },
                    regexp: {
                        regexp: /^[A-Za-z0-9\s]+([A-Za-z0-9\s&()/',-.:#]+)?$/,
                        message: `The End Location can consist of alphanumeric characters only and ( ) , . / ' : & - # after some input`,
                    },
                    callback: {
                        message: "Please enter End Location",
                        callback: function (input) {
                            if ($('.nav-link.active').data("tab") == "map") {
                                if (input.value.trim() == "") {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        },
                    },
                },
            },
        },

        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: '.validate_Details',
                eleInvalidClass: '',
                eleValidClass: ''
            })
        }

    }
);

let imageUrl = "";
const modelSubmitButton = $(".button_save");
let activeEntryTab;
let computedMileageValue;
$(modelSubmitButton).on("click", function (e) {
    e.preventDefault();
    var IdName = $(this).attr("id");
    if (validator2) {
        validator2.validate().then(async function (status) {
            if (status == 'Valid') {
                computedMileageValue = $("#computedMileage").html();
                activeEntryTab = $('.nav-link.active').data("tab");
                $(".results-paneltag").addClass("d-none");
                if (!$('#toggleBtn').is(':checked')) {
                    if (IdName == "mileageClaims_create_Add") {
                        if (computedMileageValue !== "") {
                            loader.classList.remove("d-none");
                            imageUrl = await mapImageUrl();
                        }
                        mileageClaims_Add();
                        $("#AddDataModal").modal("hide");
                    } else {
                        if (computedMileageValue !== "") {
                            loader.classList.remove("d-none");
                            imageUrl = await mapImageUrl();
                        }
                        mileageClaims_Update();
                    }
                }
                else {
                    handlePendingEntities(IdName);
                }
            }
        });
    }
});

async function handlePendingEntities(IdName) {
    if ($("#company").val() !== '') {
        Swal.fire({
            title: "selected entities are pending to add.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Add & Save",
            customClass: {
                confirmButton: "btn button-base text-white me-1",
                cancelButton: "btn button-base-white",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        }).then(async function (result) {
            if (result.value) {
                if (IdName == "mileageClaims_create_Add") {
                    if (computedMileageValue !== "") {
                        loader.classList.remove("d-none");
                        imageUrl = await mapImageUrl();
                    }
                    $('#addEntities').click();
                    mileageClaims_Add();
                    $("#AddDataModal").modal("hide");
                } else {
                    $('#addEntities').click();
                    if (computedMileageValue !== "") {
                        loader.classList.remove("d-none");
                        imageUrl = await mapImageUrl();
                    }
                    mileageClaims_Update();
                }
            }
        });
    } else {
        if (IdName == "mileageClaims_create_Add") {
            if (computedMileageValue !== "") {
                loader.classList.remove("d-none");
                imageUrl = await mapImageUrl();
            }
            mileageClaims_Add();
            $("#AddDataModal").modal("hide");
        } else {
            if (computedMileageValue !== "") {
                loader.classList.remove("d-none");
                imageUrl = await mapImageUrl();
            }
            mileageClaims_Update();
        }
    }
}

$("#AddDataModal").on("shown.bs.modal", async function (e) {
    const checkDate = $("#mileageClaimDate").val();
    if (checkDate !== "") {
        await isExitMileageRateAPI(checkDate);
    }
    let fromTbx = document.getElementById('fromTbx');
    let totbx = document.getElementById('toTbx');
    autosize.update(fromTbx);
    autosize.update(totbx);
    if ($("#AddDataModalLabel").hasClass("d-none")) {
        if (mileageClaimsArray[hdautoId - 1].IsMapsEntry) {
            getMap();
            if (mileageRate !== null) {
                calculateDirections();
            }
            // calculateDirections();
        }
    }
});


$("#AddDataModal").on("hidden.bs.modal", function (e) {
    imageUrl = "";
    // fieldStatus = false;
    $("#AddDataModal").modal({ backdrop: "static", keyboard: false });
    $("#AddDataModalLabel").removeClass("d-none");
    $("#EditDataModalLabel").addClass("d-none");
    $("#mileageClaims_create_Add").removeClass("d-none");
    $("#mileageClaims_create_Update").addClass("d-none");
    document.getElementById("mileage_reimbursement_create_form").reset();
    validator2.resetForm();
    $("#mileageClaimDate").val('');
    $('#entitiesDiv').addClass('d-none');
    $('#addEntities').addClass('d-none');
    if (multipleEnitiesArr.length > 0) {
        populateProjects([], "project");
    }
    multipleEnitiesArr.length = 0;
    bindMultipleEntities(multipleEnitiesArr);
    $(`#clusterDiv`).empty();
    $(`#projectDiv`).empty();
    $('#clusterDiv').html(`<select class="form-select focus" id="cluster" name="Cluster" onchange="bindProject()"
          data-search="true" data-silent-initial-value-set="true">
            <option value="">Select Cluster</option>
        </select>`);

    $('#projectDiv').html(`<select class="form-select focus mw-100 multiSelectCheckbox fs-8" id="project" name="Project"
        data-search="true" data-silent-initial-value-set="true">
            <option value="">Select Project</option>
        </select>`);
    getMap();
    document.getElementById('output').innerHTML = '';
    document.getElementById("computedMileage").innerHTML = '';
    document.getElementById("actualMileidAmount").innerHTML = '';
    document.getElementById("mileshide").classList.add("d-none");
    $('a[data-bs-toggle="tab"][href="#kt_tab_pane_1"]').tab('show');
    somethingChangedForModelTab = false;
    $('#results-panel').html(`<span class="px-3 text-muted py-4">Search location to get result.</span>`);
    $('.results-paneltag').addClass('d-none');
    mileageRate = null;
});

let addamount;
function mileageClaims_Add() {
    somethingChangedForModel = false;
    let mileageAmount = $("#actualMileidAmount").html();
    AmountSeprator(mileageAmount);
    let project_text = $("#project option:selected").text() == undefined || $("#project option:selected").text() == "Select Project" ? [] : [$("#project option:selected").text()];
    let cluster_text = $("#cluster option:selected").text() == undefined || $("#cluster option:selected").text() == "Select Cluster" ? [] : [$("#cluster option:selected").text()];

    let projectCode = '';
    let company_text = '';
    let companyCode = '';
    let clusterCode = '';
    let nextGroupId = 0;
    if (mileageClaimsArray.length == 0) {
        nextGroupId = 0
    } else {
        nextGroupId = Math.max(...mileageClaimsArray.map(item => item.GroupId)) + 1;
    }
    if (multipleEnitiesArr.length > 0) {
        for (let j = 0; j < multipleEnitiesArr.length; j++) {
            projectCode = multipleEnitiesArr[j].ProjectCode;
            clusterCode = multipleEnitiesArr[j].ClusterCode;
            companyCode = multipleEnitiesArr[j].CompanyCode;
            project_text = multipleEnitiesArr[j].ProjectName;
            cluster_text = multipleEnitiesArr[j].ClusterName;
            company_text = multipleEnitiesArr[j].Company;

            for (let i = 0; i < mileageClaimsArray.length; i++) {
                if (
                    mileageClaimsArray[i].MileageDate == $("#mileageClaimDate").val() &&
                    JSON.stringify(mileageClaimsArray[i].ClusterCode) == JSON.stringify(clusterCode) &&
                    JSON.stringify(mileageClaimsArray[i].ProjectCode) == JSON.stringify(projectCode) &&
                    mileageClaimsArray[i].CompanyCode == companyCode &&
                    mileageClaimsArray[i].MileageDetailDescription == $("#Description").val()
                ) {
                    Swal.fire({
                        title: "Mileage detail already exists",
                        icon: "warning",
                        customClass: {
                            confirmButton: "btn button-base text-white me-1",
                        },
                        allowOutsideClick: false,
                        buttonsStyling: false,
                    });
                }
            }

            let multipleCheckForProject = false;
            if (!multipleCheckForProject) {
                if (mileageClaimsArray.length !== 0) {
                    var index = mileageClaimsArray.findIndex(x => x.GroupId == nextGroupId);

                    if (index !== -1) {
                        let companyIndex = mileageClaimsArray[index].CompanyCode.findIndex(code => code == multipleEnitiesArr[j].CompanyCode);

                        if (companyIndex !== -1) {
                            mileageClaimsArray[index].ClusterCode[companyIndex] = [
                                ...mileageClaimsArray[index].ClusterCode[companyIndex],
                                ...multipleEnitiesArr[j].ClusterCode
                            ];
                            mileageClaimsArray[index].ClusterName[companyIndex] = [
                                ...mileageClaimsArray[index].ClusterName[companyIndex],
                                ...multipleEnitiesArr[j].ClusterName
                            ];
                            mileageClaimsArray[index].ProjectCode[companyIndex] = [
                                ...mileageClaimsArray[index].ProjectCode[companyIndex],
                                ...multipleEnitiesArr[j].ProjectCode
                            ];
                            mileageClaimsArray[index].ProjectName[companyIndex] = [
                                ...mileageClaimsArray[index].ProjectName[companyIndex],
                                ...multipleEnitiesArr[j].ProjectName
                            ];
                        } else {
                            mileageClaimsArray[index].CompanyCode.push(multipleEnitiesArr[j].CompanyCode);
                            mileageClaimsArray[index].CompanyName.push(multipleEnitiesArr[j].Company);

                            mileageClaimsArray[index].ClusterCode.push(multipleEnitiesArr[j].ClusterCode);
                            mileageClaimsArray[index].ClusterName.push(multipleEnitiesArr[j].ClusterName);
                            mileageClaimsArray[index].ProjectCode.push(multipleEnitiesArr[j].ProjectCode);
                            mileageClaimsArray[index].ProjectName.push(multipleEnitiesArr[j].ProjectName);
                        }
                    } else {
                        mileageClaimsArray.push({
                            srno: 0,
                            MileageDate: $("#mileageClaimDate").val(),
                            CompanyName: [company_text],
                            CompanyCode: [companyCode],
                            ProjectName: [project_text],
                            ProjectCode: [projectCode],
                            ClusterCode: [clusterCode],
                            ClusterName: [cluster_text],
                            ActualMileage: activeEntryTab == "map" ? $("#ActualMile").val() : $("#mileage").val(),
                            MileageAmount: addamount,
                            StartLocation: activeEntryTab == "map" ? $("#fromTbx").val() : $("#startLocation").val(),
                            EndLocation: activeEntryTab == "map" ? $("#toTbx").val() : $("#endLocation").val(),
                            ComputedMileage: $("#computedMileage").html() == "" ? $("#mileage").val() : $("#computedMileage").html(),
                            MileageDetailDescription: $("#Description").val(),
                            GroupId: nextGroupId,
                            EntitiesStatus: $("#toggleBtn").is(':checked', true),
                            MileageDetailAttachment: imageUrl,
                            IsMapsEntry: activeEntryTab == "map" ? true : false

                        });
                    }
                }

                else {
                    mileageClaimsArray.push({
                        srno: 0,
                        MileageDate: $("#mileageClaimDate").val(),
                        CompanyName: [company_text],
                        CompanyCode: [companyCode],
                        ProjectName: [project_text],
                        ProjectCode: [projectCode],
                        ClusterCode: [clusterCode],
                        ClusterName: [cluster_text],
                        ActualMileage: activeEntryTab == "map" ? $("#ActualMile").val() : $("#mileage").val(),
                        MileageAmount: addamount,
                        StartLocation: activeEntryTab == "map" ? $("#fromTbx").val() : $("#startLocation").val(),
                        EndLocation: activeEntryTab == "map" ? $("#toTbx").val() : $("#endLocation").val(),
                        ComputedMileage: $("#computedMileage").html() == "" ? $("#mileage").val() : $("#computedMileage").html(),
                        MileageDetailDescription: $("#Description").val(),
                        GroupId: nextGroupId,
                        EntitiesStatus: $("#toggleBtn").is(':checked', true),
                        MileageDetailAttachment: imageUrl,
                        IsMapsEntry: activeEntryTab == "map" ? true : false
                    });
                }
            }
        }
    } else {
        projectCode = $('#project').val() == "" ? [] : [$('#project').val().split('|')[1]];
        clusterCode = $("#cluster").val() == "" ? [] : [$("#cluster option:selected").val().split("|")[1]];
        companyCode = $("#company option:selected").val();
        company_text = $("#company").val() == "" ? "" : $("#company option:selected").text();

        let multipleCheckForProject = false;
        let nextGroupId = 0;
        if (mileageClaimsArray.length == 0) {
            nextGroupId = 0
        } else {
            nextGroupId = Math.max(...mileageClaimsArray.map(item => item.GroupId)) + 1;
        }
        if (!multipleCheckForProject) {
            mileageClaimsArray.push({
                srno: 0,
                MileageDate: $("#mileageClaimDate").val(),
                CompanyName: [company_text],
                CompanyCode: [companyCode],
                ProjectName: [[project_text]],
                ProjectCode: [[projectCode]],
                ClusterCode: [clusterCode],
                ClusterName: [cluster_text],
                MileageDetailDescription: $("#Description").val(),
                ActualMileage: activeEntryTab == "map" ? $("#ActualMile").val() : $("#mileage").val(),
                MileageAmount: addamount,
                StartLocation: activeEntryTab == "map" ? $("#fromTbx").val() : $("#startLocation").val(),
                EndLocation: activeEntryTab == "map" ? $("#toTbx").val() : $("#endLocation").val(),
                ComputedMileage: $("#computedMileage").html() == "" ? $("#mileage").val() : $("#computedMileage").html(),
                GroupId: nextGroupId,
                EntitiesStatus: $("#toggleBtn").is(':checked', true),
                MileageDetailAttachment: imageUrl,
                IsMapsEntry: activeEntryTab == "map" ? true : false
            });
        }
    }
    mileageClaimsTable();
    $(".headerDate").attr("tabindex", "-1");
    $("#mileageClaimDate").val("");
    $("#Project").val("");
    if (mileageClaimsArray.length != 0) {
        $(".headerDate").addClass("pe-none").attr("tabindex", "-1");
    } else {
        $(".headerDate").removeClass("pe-none").attr("tabindex", "0");
    }
}

var hdautoId;
let IsEditModel = false;
function mileageClaims_Edit(srno) {
    IsEditModel = true;
    somethingChangedForModelTab = true;
    $("#AddDataModal").modal("show");
    $("#AddDataModalLabel").addClass("d-none");
    $("#EditDataModalLabel").removeClass("d-none");
    $("#mileageClaims_create_Add").addClass("d-none");
    $("#mileageClaims_create_Update").removeClass("d-none");
    var filteredData = mileageClaimsArray.filter((x) => x.srno == srno);
    if (filteredData[0].EntitiesStatus == true) {

        $("#toggleBtn").click();
        multipleEnitiesArr.push({
            Id: 0,
            Company: filteredData[0].CompanyName,
            CompanyCode: filteredData[0].CompanyCode,
            ProjectName: filteredData[0].ProjectName,
            ProjectCode: filteredData[0].ProjectCode,
            ClusterName: filteredData[0].ClusterName,
            ClusterCode: filteredData[0].ClusterCode,
        });
        bindMultipleEntities(multipleEnitiesArr, "edit");

        $("#entitiesDiv").removeClass('d-none');
    } else {
        $("#company").val(filteredData[0].CompanyCode);
        bindCluster(filteredData[0].CompanyCode, filteredData[0].ClusterCode, filteredData[0].ProjectCode);
        bindProject(filteredData[0].ClusterCode);
    }

    if (filteredData[0].IsMapsEntry) {
        $("#fromTbx").val(filteredData[0].StartLocation);
        $("#toTbx").val(filteredData[0].EndLocation);
        $("#ActualMile").val(filteredData[0].ActualMileage);
        // calculateDirections(true);
    } else {
        $("#startLocation").val(filteredData[0].StartLocation);
        $("#endLocation").val(filteredData[0].EndLocation);
        $("#mileage").val(filteredData[0].ActualMileage);
    }
    // $("#mileage").val(filteredData[0].ActualMileage),
    // $("#ActualMile").val(filteredData[0].ActualMileage);
    $("#actualMileidAmount").html(filteredData[0].MileageAmount);
    $("#mileageClaimDate")
        .flatpickr({
            allowInput: true,
            altInput: true,
            altFormat: "m-d-Y",
            dateFormat: "Y-m-d",
            maxDate: $("#Todate").val(),
            minDate: $("#FromDate").val(),
            onClose: function (sel_date, date_str, instance) {
                if (date_str !== "") {
                    isExitMileageRateAPI(date_str)
                }else{
                    mileageRate = null;
                    $("#actualMileidAmount").html("0.00");
                }
            }
        })
        .setDate(filteredData[0].MileageDate);
    if (filteredData[0].ClusterCode !== "" && filteredData[0].ProjectCode != "") {
        $("#project").val(
            filteredData[0].ClusterCode + "|" + filteredData[0].ProjectCode
        );
    } else {
        bindProject(filteredData[0].ClusterCode);
    }
    if (filteredData[0].EntitiesStatus == false) {
        if (filteredData[0].CompanyCode !== "" && filteredData[0].ClusterCode != "") {
            $("#cluster").val(
                filteredData[0].CompanyCode + "|" + filteredData[0].ClusterCode
            );
        } else {
            bindCluster(filteredData[0].CompanyCode, filteredData[0].ClusterCode, filteredData[0].ProjectCode);
        }
    }
    $("#Description").val(filteredData[0].MileageDetailDescription);
    somethingChangedForModel = false;
    hdautoId = srno;

    if (filteredData[0].IsMapsEntry) {
        $('a[data-bs-toggle="tab"][href="#kt_tab_pane_2"]').tab('show');
    } else {
        $('a[data-bs-toggle="tab"][href="#kt_tab_pane_1"]').tab('show');
    }
}

function mileageClaims_Update() {
    somethingChangedForModel = false;
    let amount = $("#actualMileidAmount").html();
    AmountSeprator(amount, true, hdautoId);
    let index = hdautoId - 1;
    let cluster_text = '';
    let project_text = '';
    let projectCode = '';
    let company_text = '';
    let companyCode = '';
    let clusterCode = '';
    if (multipleEnitiesArr.length > 0) {
        for (let j = 0; j < multipleEnitiesArr.length; j++) {
            project_text = multipleEnitiesArr[j].ProjectName;
            cluster_text = multipleEnitiesArr[j].ClusterName;
            company_text = multipleEnitiesArr[j].Company;
            companyCode = multipleEnitiesArr[j].CompanyCode;
            projectCode = multipleEnitiesArr[j].ProjectCode
            clusterCode = multipleEnitiesArr[j].ClusterCode
            for (let i = 0; i < mileageClaimsArray.length; i++) {
                if (hdautoId != mileageClaimsArray[i].srno) {
                    if (
                        mileageClaimsArray[i].MileageDate == $("#mileageClaimDate").val() &&
                        JSON.stringify(mileageClaimsArray[i].ClusterCode) == JSON.stringify(clusterCode) &&
                        JSON.stringify(mileageClaimsArray[i].ProjectCode) == JSON.stringify(projectCode) &&
                        mileageClaimsArray[i].CompanyCode == companyCode &&
                        mileageClaimsArray[i].MileageDetailDescription == $("#Description").val()
                    ) {
                        Swal.fire({
                            title: "Mileage detail already exists",
                            icon: "warning",
                            customClass: {
                                confirmButton: "btn button-base text-white me-1",
                            },
                            allowOutsideClick: false,
                            buttonsStyling: false,
                        });
                    }
                }
            }
            mileageClaimsArray[index].MileageDate = $("#mileageClaimDate").val();
            mileageClaimsArray[index].ActualMileage = activeEntryTab == "map" ? $("#ActualMile").val() : $("#mileage").val();
            mileageClaimsArray[index].MileageAmount = addamount;
            mileageClaimsArray[index].EntitiesStatus = $("#toggleBtn").is(':checked', true);
            mileageClaimsArray[index].MileageDetailDescription = $("#Description").val();
            mileageClaimsArray[index].ComputedMileage = $("#computedMileage").html() == "" ? $("#mileage").val() : $("#computedMileage").html();
            mileageClaimsArray[index].MileageDetailAttachment = imageUrl;
            mileageClaimsArray[index].StartLocation = activeEntryTab == "map" ? $("#fromTbx").val() : $("#startLocation").val();
            mileageClaimsArray[index].EndLocation = activeEntryTab == "map" ? $("#toTbx").val() : $("#endLocation").val();
            mileageClaimsArray[index].IsMapsEntry = activeEntryTab == "map" ? true : false;

            let duplicateExists = true;
            if (mileageClaimsArray[index].CompanyCode.length !== 0) {
                var companyIndex = mileageClaimsArray[index].CompanyCode.findIndex(x => JSON.stringify([x]) == JSON.stringify([companyCode]));
                if (companyIndex !== -1) {
                    if (multipleEnitiesArr[j].CompanyCode === mileageClaimsArray[index].CompanyCode[companyIndex]) {
                        duplicateExists = true
                    } else {
                        duplicateExists = false
                    }
                } else {
                    duplicateExists = false
                }
                if (duplicateExists) {
                    mileageClaimsArray[index].CompanyName[companyIndex] = company_text;
                    mileageClaimsArray[index].CompanyCode[companyIndex] = companyCode;
                    mileageClaimsArray[index].ProjectName[companyIndex] = project_text;
                    mileageClaimsArray[index].ProjectCode[companyIndex] = projectCode;
                    mileageClaimsArray[index].ClusterName[companyIndex] = cluster_text;
                    mileageClaimsArray[index].ClusterCode[companyIndex] = clusterCode;
                } else {
                    for (let i = 0; i < mileageClaimsArray.length; i++) {
                        if (hdautoId != mileageClaimsArray[i].srno) {
                            if (
                                mileageClaimsArray[i].MileageDate == $("#mileageClaimDate").val() &&
                                JSON.stringify(mileageClaimsArray[i].ClusterCode) == JSON.stringify(clusterCode) &&
                                JSON.stringify(mileageClaimsArray[i].ProjectCode) == JSON.stringify(projectCode) &&
                                mileageClaimsArray[i].CompanyCode == companyCode &&
                                mileageClaimsArray[i].MileageDetailDescription == $("#Description").val()
                            ) {
                                Swal.fire({
                                    title: "Mileage detail already exists",
                                    icon: "warning",
                                    customClass: {
                                        confirmButton: "btn button-base text-white me-1",
                                    },
                                    allowOutsideClick: false,
                                    buttonsStyling: false,
                                });
                            }
                        }
                    }
                    mileageClaimsArray[index].CompanyCode.push(multipleEnitiesArr[j].CompanyCode);
                    mileageClaimsArray[index].CompanyName.push(multipleEnitiesArr[j].Company);
                    mileageClaimsArray[index].ClusterCode.push(multipleEnitiesArr[j].ClusterCode);
                    mileageClaimsArray[index].ClusterName.push(multipleEnitiesArr[j].ClusterName);
                    mileageClaimsArray[index].ProjectCode.push(multipleEnitiesArr[j].ProjectCode);
                    mileageClaimsArray[index].ProjectName.push(multipleEnitiesArr[j].ProjectName);
                }
            } else {
                if (mileageClaimsArray[index].CompanyCode === "") {
                    mileageClaimsArray[index].CompanyCode = []
                    mileageClaimsArray[index].CompanyName = []
                }
                mileageClaimsArray[index].CompanyCode.push(multipleEnitiesArr[j].CompanyCode);
                mileageClaimsArray[index].CompanyName.push(multipleEnitiesArr[j].Company);
                mileageClaimsArray[index].ClusterCode.push(multipleEnitiesArr[j].ClusterCode);
                mileageClaimsArray[index].ClusterName.push(multipleEnitiesArr[j].ClusterName);
                mileageClaimsArray[index].ProjectCode.push(multipleEnitiesArr[j].ProjectCode);
                mileageClaimsArray[index].ProjectName.push(multipleEnitiesArr[j].ProjectName);
            }
        }
    } else {
        companyCode = $("#company option:selected").val();
        company_text = $("#company option:selected").text();
        projectCode = $('#project').val() == "" ? [] : [$('#project').val().split('|')[1]];
        clusterCode = $("#cluster option:selected").val() == "" ? [] : [$("#cluster option:selected").val().split("|")[1]];
        project_text = $("#project option:selected").text() == undefined || $("#project option:selected").text() == "Select Project" ? [] : [$("#project option:selected").text()];
        cluster_text = $("#cluster option:selected").text() == undefined || $("#cluster option:selected").text() == "Select Cluster" ? [] : [$("#cluster option:selected").text()];

        mileageClaimsArray[index].MileageDate = $("#mileageClaimDate").val();
        mileageClaimsArray[index].ActualMileage = activeEntryTab == "map" ? $("#ActualMile").val() : $("#mileage").val();
        mileageClaimsArray[index].MileageAmount = addamount;
        mileageClaimsArray[index].CompanyName = [company_text];
        mileageClaimsArray[index].CompanyCode = [companyCode];
        mileageClaimsArray[index].ProjectName = [[project_text]];
        mileageClaimsArray[index].ProjectCode = [[projectCode]];
        mileageClaimsArray[index].ClusterName = [[cluster_text]];
        mileageClaimsArray[index].ClusterCode = [[clusterCode]];
        mileageClaimsArray[index].ComputedMileage = $("#computedMileage").html() == "" ? $("#mileage").val() : $("#computedMileage").html();
        mileageClaimsArray[index].EntitiesStatus = $("#toggleBtn").is(':checked', true);
        mileageClaimsArray[index].MileageDetailDescription = $("#Description").val();
        mileageClaimsArray[index].MileageDetailAttachment = imageUrl;
        mileageClaimsArray[index].StartLocation = activeEntryTab == "map" ? $("#fromTbx").val() : $("#startLocation").val();
        mileageClaimsArray[index].EndLocation = activeEntryTab == "map" ? $("#toTbx").val() : $("#endLocation").val();
        mileageClaimsArray[index].IsMapsEntry = activeEntryTab == "map" ? true : false;
    }
    $("#AddDataModal").modal("hide");
    mileageClaimsTable();
}

function mileageClaims_Delete(id) {
    Swal.fire({
        title: "Are you sure you want to delete?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "btn button-base text-white me-1",
            cancelButton: "btn button-base-white",
        },
        allowOutsideClick: false,
        buttonsStyling: false,
    }).then(function (result) {
        if (result.value) {
            mileageClaimsArray = $.grep(mileageClaimsArray, function (element, index) {
                return index != id;
            });
            mileageClaimsTable();
            if (mileageClaimsArray.length != 0) {
                $(".headerDate").addClass("pe-none").attr("tabindex", "-1");
            } else {
                $(".headerDate").removeClass("pe-none").attr("tabindex", "0");
            }
            Swal.fire({
                title: "Deleted Succesfully",
                icon: "success",
                customClass: {
                    confirmButton: "btn button-base text-white me-1",
                },
                allowOutsideClick: false,
                buttonsStyling: false,
            });
        }
    });
}

function mileageClaimsTable() {
    var html = "";
    let tableColoumnLength = $("#mileage_create_table thead").find("th").length
    if (mileageClaimsArray.length == 0) {
        html += `<tr><td colspan="${tableColoumnLength}" class="text-center">No data available in table</td></tr>`
    } else {
        html += ``
    }

    $.each(mileageClaimsArray, function (key, item) {

        mileageClaimsArray[key].ClusterCode == null ? mileageClaimsArray[key].ClusterCode = "" : mileageClaimsArray[key].ClusterCode = mileageClaimsArray[key].ClusterCode
        mileageClaimsArray[key].ProjectCode == null ? mileageClaimsArray[key].ProjectCode = "" : mileageClaimsArray[key].ProjectCode = mileageClaimsArray[key].ProjectCode
        mileageClaimsArray[key].ProjectName == null ? mileageClaimsArray[key].ProjectName = "" : mileageClaimsArray[key].ProjectName = mileageClaimsArray[key].ProjectName
        mileageClaimsArray[key].ClusterName == null ? mileageClaimsArray[key].ClusterName = "" : mileageClaimsArray[key].ClusterName = mileageClaimsArray[key].ClusterName
        let companyRowSpan = '';
        let rowspanValue = '';
        let clusterRowSpans = '';
        var totalProjects1 = 0;
        var totalCluster1 = 0;

        item.ProjectName.forEach((projectArray, subindex) => {

            totalProjects1 += projectArray.reduce((count, array) => {
                return count + (array.length === 0 ? 1 : array.length);
            }, 0);
            if (subindex == 0) {
                companyRowSpan = totalProjects1;
            }
        });

        totalCluster1 += item.ClusterName.reduce((sum, subcluster) => sum + subcluster.length, 0);

        if (totalCluster1 > totalProjects1) {
            rowspanValue = totalCluster1
        } else {
            rowspanValue = totalProjects1
        }
        if (item.EntitiesStatus) {
            if (item.ClusterName.length == 0) {
                clusterRowSpans = item.ClusterName.length + 1;
            } else {
                let totalProjects = item.ProjectName[0][0].length;
                clusterRowSpans = totalProjects == 0 ? 1 : totalProjects;
            }
        } else {
            rowspanValue = 1;
        }

        mileageClaimsArray[key].srno = key + 1;
        // mileageRate = MileageRate;
        html += `<tr id="row_${item.srno}">
        <td rowspan="${rowspanValue}" class="min-w-150px w-150px" style="padding-right: 8px !important;">
        <input type="file" hidden id="model_Image_${key}" name="MileageDetailAttachmentID[${key}]"  />
        <input type="hidden" name="mileageList[${key}].MileageRate" value="${mileageRate}" />
        <input type="hidden" name="mileageList[${key}].StartLocation" value="${item.StartLocation}" />
        <input type="hidden" name="mileageList[${key}].EndLocation" value="${item.EndLocation}" />
        <input type="hidden" name="mileageList[${key}].IsMapsEntry" value="${item.IsMapsEntry}" />
        <input type="text" class="border-0 bg-transparent pe-none p-0 text-end pe-1 h-20px tableDate" tabindex="-1" style="box-shadow:none" readonly id="tbldate" 
        name="mileageList[${key}].MileageDate" value="${item.MileageDate}" /></td>`
        html +=
            `<td rowspan="${companyRowSpan}" id="Column_${item.srno}'_1">
            <span class="text-center" >${item.CompanyName[0]}</span>
            </td>`
        html +=
            '<td rowspan="' + clusterRowSpans + '" id="Column_' +
            item.srno +
            '_2"><input type="hidden" class="border-0 bg-transparent pe-1" style="box-shadow:none" readonly id="tbldate" name="mileageList[' +
            key +
            '].Id" value="' +
            item.srno +
            '" />\
                <input type="hidden" class="border-0 bg-transparent pe-1" style="box-shadow:none" readonly id="tbldate" name="mileageList[' +
            key +
            '].GroupId" value="' +
            item.GroupId +
            '" />'
        let clustername = item.ClusterName == undefined || item.ClusterName.length == 0
            ? item.ClusterName : item.ClusterName[0][0];
        html += `
      <span class="text-center" id="entity_val${key}" >${clustername == undefined ? "" : clustername}</span>`
        html +=
            ' </td>'
        html +=
            '<td id="Column_' +
            item.srno +
            '_3">'
        let projectname = item.ProjectName == undefined || item.ProjectName.length == 0
            ? item.ProjectName : item.ProjectName[0][0];
        if (item.CompanyCode.length == 1) {
            if (item.EntitiesStatus) {
                projectname = projectname[0]
            } else {
                projectname = projectname
            }
        } else {
            projectname = projectname[0]
        }
        html += `<span class="text-center" id="project_val${key}" >${projectname == undefined ? "" : projectname}</span>`
        html += `
      <input type='hidden' name="mileageList[${key}].EntitiesStatus" value="${mileageClaimsArray[key].EntitiesStatus}">
      <div id="multipleEntities"></div>
      </td>`
        html += `
        <td rowspan="${rowspanValue}"><span class="text-center">${item.StartLocation}</span></td>
        <td rowspan="${rowspanValue}"><span class="text-center">${item.EndLocation}</span></td>
        <td style="padding-right: 8px !important;" rowspan="${rowspanValue}"><input type="hidden" name="mileageList[${key}].ActualMileage" value="${item.ActualMileage}" />
        <input type="hidden" name="mileageList[${key}].ComputedMileage" value="${item.ComputedMileage}" />
        <span class="float-end">${item.ActualMileage}</span></td>
        <td style="padding-right: 8px !important;" rowspan="${rowspanValue}"><input type="hidden" name="mileageList[${key}].MileageAmount" value="${item.MileageAmount}" />
        <span class="float-end tableAmountSymbol">${item.MileageAmount}</span></td>
        <td rowspan="${rowspanValue}"><input type="hidden" name="mileageList[${key}].MileageDetailDescription" value="${item.MileageDetailDescription}" />
        <span class="text-center">${item.MileageDetailDescription}</span></td>
        <td rowspan="${rowspanValue}" style="padding:8px !important">`
        if (item.MileageDetailAttachment !== "") {
            html += `<div class="position-relative"><a class="d-block overlay" title=""
                    onclick="append(${key},${key})">
                    <div id="preview_${key}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-75px w-100">
                    </div>
                    <div class="overlay-layer card-rounded bg-dark bg-opacity-25 min-h-75px w-100 shadow">
                        <i class="bi bi-eye-fill text-white fs-3x"></i>
                    </div>
                    <a href="" id="download_${key}" title="Download" download class="btn btn-icon btn-circle btn-color-muted btn-active-color-primary bg-body shadow position-absolute bottom-0 end-0 bg-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"></path>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"></path>
                        </svg>
                    </a>
                    </a></div>`
        }
        html += `</td>
        <td rowspan="${rowspanValue}" class="w-50px"><ul class="list-unstyled d-flex justify-content-center gap-3 mb-1">
                <li>
                    <button type="button" onclick="mileageClaims_Edit(${key + 1})" class="btn btn-icon btn-light-twitter me-2 btn-sm" tabindex="0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">        <g clip-path="url(#clip0_2650_37554)">        <path d="M7.33203 2.66812H4.53203C3.41193 2.66812 2.85187 2.66812 2.42405 2.88611C2.04773 3.07785 1.74176 3.38382 1.55002 3.76014C1.33203 4.18796 1.33203 4.74802 1.33203 5.86812V11.4681C1.33203 12.5882 1.33203 13.1483 1.55002 13.5761C1.74176 13.9524 2.04773 14.2584 2.42405 14.4501C2.85187 14.6681 3.41193 14.6681 4.53203 14.6681H10.132C11.2521 14.6681 11.8122 14.6681 12.24 14.4501C12.6163 14.2584 12.9223 13.9524 13.114 13.5761C13.332 13.1483 13.332 12.5882 13.332 11.4681V8.66812M5.33201 10.6681H6.44838C6.7745 10.6681 6.93756 10.6681 7.09101 10.6313C7.22706 10.5986 7.35711 10.5447 7.47641 10.4716C7.61097 10.3892 7.72627 10.2739 7.95687 10.0433L14.332 3.66812C14.8843 3.11584 14.8843 2.2204 14.332 1.66812C13.7797 1.11584 12.8843 1.11583 12.332 1.66812L5.95685 8.04328C5.72625 8.27388 5.61095 8.38919 5.52849 8.52374C5.45539 8.64304 5.40152 8.7731 5.36885 8.90915C5.33201 9.0626 5.33201 9.22566 5.33201 9.55178V10.6681Z" stroke="#797979" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>        </g>        <defs>        <clipPath id="clip0_2650_37554">        <rect width="16" height="16" fill="white"></rect>
                        </clipPath></defs>
                    </svg>
                    </button>
                </li>
                <li>
                    <button type="button" onclick="mileageClaims_Delete(${key})" id="deleterow" class="btn btn-icon btn-light-youtube me-2 btn-sm deleterow del" tabindex="0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">        <path d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.871 12.065 3.80086 11.0129L3.33333 4" stroke="#F40000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                            </path>      
                        </svg>
                    </button>
                </li>
            </ul>
        </tr>
        `;

        if (item.ClusterName != '' && item.EntitiesStatus) {
            item.CompanyName.forEach((company, companyIndex) => {
                item.ClusterName[companyIndex].forEach((cluster, clusterIndex) => {
                    if (clusterIndex > 0 || companyIndex > 0) {
                        let otherCluster = cluster;
                        let clusterRowspan = cluster.length;
                        if (cluster.length !== 0) {
                            cluster.forEach((childCluster, childClusterIndex) => {
                                if (item.ProjectName[companyIndex][clusterIndex].length == 0) {
                                    clusterRowspan = 1
                                    html += `<tr>`
                                    if (clusterIndex == 0) {
                                        let companycount = item.ProjectName[companyIndex].length
                                        html += `<td rowspan="${companycount}"><span class="text-center" >${company}</span></td>`
                                    }
                                    html += `<td rowspan="${clusterRowspan}"><span class="text-center" >${otherCluster}</span></td><td></td>`
                                    html += `</tr>`;
                                } else {
                                    clusterRowspan = item.ProjectName[companyIndex][clusterIndex].length;
                                    let companyrowspan = 0;
                                    companyrowspan += item.ProjectName[companyIndex].reduce((count, array) => {
                                        return count + (array.length === 0 ? 1 : array.length);
                                    }, 0);
                                    item.ProjectName[companyIndex][clusterIndex].forEach((project, projectIndex) => {
                                        html += `<tr>`
                                        if (clusterIndex == 0 && companyIndex > 0 && projectIndex == 0) {
                                            html += `<td rowspan="${companyrowspan}"><span class="text-center" >${company}</span></td>`
                                        }
                                        if (projectIndex === 0) {
                                            html += `<td rowspan="${clusterRowspan}"><span class="text-center">${childCluster}</span></td>`
                                        }
                                        html += `<td><span class="text-center">${project}</span></td>`
                                    });
                                    html += `</tr>`;
                                }
                            });
                        } else {
                            html += `<tr>`
                            if (companyIndex > 0) {
                                html += `<td rowspan="${clusterRowspan == 0 ? 1 : clusterRowspan}"><span class="text-center" >${company}</span></td><td></td><td></td>`
                            }
                            html += `</tr>`;
                        }
                    } else {
                        if (item.ProjectName[companyIndex][clusterIndex].length !== 0) {
                            item.ProjectName[companyIndex][clusterIndex].forEach((subproject, projectIndex) => {
                                if (projectIndex > 0) {
                                    html += `<tr>
                          <td><span class="text-center">${subproject}</span></td>
                        </tr>`;
                                }
                            })
                        }
                    }
                });
            });
        }
    });
    $("#Mileage_createTable_body").html(html);
    const amounts = document.querySelectorAll('.tableAmountSymbol');
    amounts.forEach(function (amount) {
        amount.textContent = amount.textContent == "" ? "" : '$' + amount.textContent;
    });
    if (mileageClaimsArray.length != 0) {
        $("#btnClear").removeClass("disabled");
        $("#btnClear").removeClass("disabled");
        $("#btnClear").attr("tabindex", "0");
    }
    if (mileageClaimsArray.length == 0) {
        $("#btnClear").addClass("disabled");
        $("#btnClear").attr("tabindex", "-1");
    }

    var multipleEntities = "";
    for (let i = 0; i < mileageClaimsArray.length; i++) {
        for (let j = 0; j < mileageClaimsArray[i].CompanyCode.length; j++) {
            if (mileageClaimsArray[i].CompanyCode[j] === undefined || mileageClaimsArray[i].CompanyCode[j] === "") {
                continue;
            }
            if (mileageClaimsArray[i].CompanyName[j] === undefined || mileageClaimsArray[i].CompanyName[j] === "") {
                continue;
            }
            multipleEntities += `<input type="hidden" name="mileageList[${i}].CompanyList[${j}].CompanyCode" value="${mileageClaimsArray[i].CompanyCode[j]}">
            <input type="hidden" name="mileageList[${i}].CompanyList[${j}].CompanyName" value="${mileageClaimsArray[i].CompanyName[j]}">`;
            for (let k = 0; k < mileageClaimsArray[i].ClusterCode[j].length; k++) {
                if (mileageClaimsArray[i].ClusterCode[j][k] === undefined || mileageClaimsArray[i].ClusterCode[j][k].length === 0) {
                    continue;
                }
                if (mileageClaimsArray[i].ClusterName[j][k] === undefined || mileageClaimsArray[i].ClusterName[j][k].length === 0) {
                    continue;
                }
                multipleEntities += `<input type="hidden" name="mileageList[${i}].CompanyList[${j}].ClusterList[${k}].ClusterCode" value="${mileageClaimsArray[i].ClusterCode[j][k] == undefined ? [] : mileageClaimsArray[i].ClusterCode[j][k]}">
                <input type="hidden" name="mileageList[${i}].CompanyList[${j}].ClusterList[${k}].ClusterName" value="${mileageClaimsArray[i].ClusterName[j][k] == undefined ? [] : mileageClaimsArray[i].ClusterName[j][k]}">`;
                for (let l = 0; l < (mileageClaimsArray[i].ProjectCode[j][k] && mileageClaimsArray[i].ProjectCode[j][k].length || 0); l++) {
                    if (mileageClaimsArray[i].ProjectCode[j][k] === undefined || mileageClaimsArray[i].ProjectCode[j][k].length === 0) {
                        continue;
                    }
                    if (mileageClaimsArray[i].ProjectName[j][k] === undefined || mileageClaimsArray[i].ProjectName[j][k].length === 0) {
                        continue;
                    }
                    multipleEntities += `<input type="hidden" name="mileageList[${i}].CompanyList[${j}].ClusterList[${k}].ProjectList[${l}].ProjectCode" value="${mileageClaimsArray[i].ProjectCode[j][k][l] == undefined ? [] : mileageClaimsArray[i].ProjectCode[j][k][l]}">
                    <input type="hidden" name="mileageList[${i}].CompanyList[${j}].ClusterList[${k}].ProjectList[${l}].ProjectName" value="${mileageClaimsArray[i].ProjectName[j][k][l] == undefined ? [] : mileageClaimsArray[i].ProjectName[j][k][l]}">`;
                }
            }
        }
    }
    $("#multipleEntities").html(multipleEntities);

    let imgKey = 0;

    $.each(mileageClaimsArray, function (_, item) {
        const attachment = item?.MileageDetailAttachment;

        // Skip if attachment is null, undefined, or not a File/Blob
        if (!(attachment instanceof File)) return;

        const groupId = item.GroupId ?? '';
        const fileInput = $(`#model_Image_${imgKey}`);
        if (fileInput.length === 0) return;

        // Prepare file with custom name (originalName|groupId)
        const fileName = `${attachment.name}|${groupId}`;
        const formData = new FormData();
        formData.append('MileageDetailAttachmentID', attachment, fileName);

        const file = [...formData][0][1]; // safely access the file
        if (!file) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput[0].files = dataTransfer.files;
        dispalyImage(file, _);
        imgKey++;
    });



    for (let i = 0; i < mileageClaimsArray.length; i++) {
        $("input[name='mileageList[" + i + "].MileageDate']").flatpickr({
            altInput: true,
            altFormat: "m-d-Y",
            dateFormat: "Y-m-d",
            maxDate: new Date(),
        });
    }
    $('.tableDate').attr("style", "background-color: #fff !important;box-shadow:none;color:#000;border:none!important");
}

// ----------------------------------------------------- //




$('#toggleBtn').on('click', function () {
    if (multipleEnitiesArr.length > 0) {
        Swal.fire({
            title: "Are you sure Data in Table will be lost?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: "btn btn-sm btn-primary me-1",
                cancelButton: "btn btn-sm ",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        }).then(function (result) {
            if (result.isConfirmed) {
                multipleEnitiesArr.length = 0; // Clear the array
                $("#entitiesDiv").addClass("d-none")
                $('#entitiesDiv').addClass('d-none');
                multipleEnitiesArr.length = 0;
                if ($("#AddDataModalLabel").hasClass("d-none")) {
                    if (mileageClaimsArray.length !== 0) {
                        if (multipleEnitiesArr.length == 0) {
                            index = hdautoId - 1
                            mileageClaimsArray[index].CompanyName = ""
                            mileageClaimsArray[index].CompanyCode = ""
                            mileageClaimsArray[index].ClusterCode = []
                            mileageClaimsArray[index].ClusterName = []
                            mileageClaimsArray[index].ProjectCode = []
                            mileageClaimsArray[index].ProjectName = []
                        }
                    }
                }
                bindMultipleEntities(multipleEnitiesArr);
                $('#addEntities').addClass('d-none');
                project.destroy();
                $('#clusterDiv').html(`<select class="form-select focus" id="cluster" name="Cluster" onchange="bindProject()"
              data-search="true" data-silent-initial-value-set="true">
                <option value="">Select Cluster</option>
            </select>`);
                $('#projectDiv').html(`<select class="form-select focus mw-100 multiSelectCheckbox fs-8" id="project" name="Project"
            data-search="true" data-silent-initial-value-set="true">
                <option value="">Select Project</option>
            </select>`);
            } else {
                somethingChangedForModel = false;
                $('#toggleBtn').prop('checked', true);
            }
        });
    }
    else if ($("#company").val() !== "" && $("#AddDataModalLabel").hasClass("d-none")) {
        Swal.fire({
            title: "Are you sure selected entities will be removed?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: "btn btn-sm btn-primary me-1",
                cancelButton: "btn btn-sm ",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        }).then(function (result) {
            if (result.isConfirmed) {
                $("#company").val('');
                $("#cluster").val('');
                $("#project").val('');
                if (mileageClaimsArray.length !== 0) {
                    index = hdautoId - 1
                    mileageClaimsArray[index].CompanyName = ""
                    mileageClaimsArray[index].CompanyCode = ""
                    mileageClaimsArray[index].ClusterCode = []
                    mileageClaimsArray[index].ClusterName = []
                    mileageClaimsArray[index].ProjectCode = []
                    mileageClaimsArray[index].ProjectName = []
                }
                $('#addEntities').removeClass('d-none');
                var selectElement1 = document.getElementById("project");
                var attributes1 = {
                    "multiple": "true",
                };
                for (var key in attributes1) {
                    if (attributes1.hasOwnProperty(key)) {
                        selectElement1.setAttribute(key, attributes1[key]);
                    }
                }
                VirtualSelect.init({
                    ele: ".multiSelectCheckbox",
                });
                populateProjects([], "project");
                $('.multiSelectCheckbox').addClass('p-0');
                $('.vscomp-toggle-button').addClass('form-select');
            } else {
                somethingChangedForModel = false;
                $('#toggleBtn').prop('checked', false);
            }
        });
    }
    else {
        $('#company').val('');
        $('#cluster').val('');
        if ($(this).is(':checked', true)) {
            $('#addEntities').removeClass('d-none');
            var selectElement1 = document.getElementById("project");
            var attributes1 = {
                "multiple": "true",
            };
            for (var key in attributes1) {
                if (attributes1.hasOwnProperty(key)) {
                    selectElement1.setAttribute(key, attributes1[key]);
                }
            }
            VirtualSelect.init({
                ele: ".multiSelectCheckbox",
            });
            // populateCluster([], "cluster");
            populateProjects([], "project");
            $('.multiSelectCheckbox').addClass('p-0');
            $('.vscomp-toggle-button').addClass('form-select');
        } else {
            $('#entitiesDiv').addClass('d-none');
            multipleEnitiesArr.length = 0;
            bindMultipleEntities(multipleEnitiesArr);
            $('#addEntities').addClass('d-none');
            // cluster.destroy();
            project.destroy();
            $(`#clusterDiv`).empty();
            $(`#projectDiv`).empty();
            $('#clusterDiv').html(`<select class="form-select focus" id="cluster" name="Cluster" onchange="bindProject()">
            <option value="">Select Cluster</option>
        </select>`);

            $('#projectDiv').html(`<select class="form-select focus mw-100 multiSelectCheckbox fs-8" id="project" name="Project"
        data-search="true" data-silent-initial-value-set="true">
            <option value="">Select Project</option>
        </select>`);
        }
    }
});

let checkDuplicateEntitiesAdd = [];
function checkDuplicateInEntities(entities, newEntries, arrlengh) {
    checkDuplicateEntitiesAdd = [];
    for (let i = 0; i < entities.length; i++) {
        let loopLengh = 0;
        if (arrlengh == 'ProjectCode') {
            loopLengh = entities[i].ProjectCode.length;
        } else {
            loopLengh = entities[i].ClusterCode.length;
        }
        for (let k = 0; k < loopLengh; k++) {
            for (let j = 0; j < newEntries.length; j++) {
                const includeArray = arrlengh == 'ProjectCode' ? entities[i].ProjectCode : entities[i].ClusterCode;
                for (let l = 0; l < includeArray.length; l++) {
                    if (includeArray[l].includes(newEntries[j])) {
                        if (arrlengh == 'ProjectCode') {
                            checkDuplicateEntitiesAdd.push(newEntries[j]);
                        } else {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

let multipleEnitiesArr = [];
$('#addEntities').on('click', async function () {
    validator2.validateField('Company');
    if ($('#company').val() !== '') {
        $('#entitiesDiv').removeClass('d-none');
        let returnText1 = [];
        let returnText2 = [];
        let companyCode = $("#company option:selected").val();
        let companyName = $("#company option:selected").text();
        let clusterCode = $('#cluster').val() == "" ? [] : [$('#cluster').val().split('|')[1]];
        let projectCode = '';
        if ($("#toggleBtn").is(':checked', true)) {
            if ($('input[name=Project]').val().includes(',')) {
                let inputString = $('input[name=Project]').val() == "" ? "" : $('input[name=Project]').val();
                let splitByComma = inputString.split(',');
                let lastValues = splitByComma.map(part => part.split('|').pop());
                projectCode = lastValues;
            } else {
                projectCode = $('input[name=Project]').val() == "" ? [] : [$('input[name=Project]').val().split('|')[1]];
            }
        } else {
            projectCode = $('input[name=Project]').val() == "" ? [] : [$('input[name=Project]').val().split('|')[1]];
        }
        returnText2 = getTextOfSelectedOptions("#project");
        let clusterName = $('#cluster').val() == "" ? [] : [$('#cluster option:selected').text()];
        let projectName = returnText2;

        let duplicateExists = multipleEnitiesArr.some(item =>
            item.CompanyCode === companyCode

        );
        let clusterCodeDuplicate = false;
        let projectDuplicate = false;
        if (JSON.stringify(projectCode) !== JSON.stringify([])) {
            if (multipleEnitiesArr.length !== 0) {

                clusterCodeDuplicate = checkDuplicateInEntities(multipleEnitiesArr, clusterCode, 'ClusterCode');
                projectDuplicate = checkDuplicateInEntities(multipleEnitiesArr, projectCode, 'ProjectCode');
                if (projectDuplicate == false) {
                    duplicateExists = false
                } else {
                    duplicateExists = true
                }
            }
        } else {
            if (duplicateExists != false) {
                if (multipleEnitiesArr.length !== 0) {
                    if (JSON.stringify(clusterCode) == JSON.stringify([]) && JSON.stringify(projectCode) == JSON.stringify([])) {
                        duplicateExists = true;
                    } else {
                        duplicateExists = false;
                    }
                }
            }
        }

        if (!duplicateExists && (!projectDuplicate || !clusterCodeDuplicate)) {
            let checkEntities = multipleEnitiesArr.some(item =>
                item.CompanyCode === companyCode

            );
            if (multipleEnitiesArr.length > 0 && checkEntities) {
                checkArr(multipleEnitiesArr)
            } else {

                multipleEnitiesArr.push({
                    Id: 0,
                    Company: companyName,
                    CompanyCode: companyCode,
                    ProjectName: [projectName],
                    ProjectCode: [projectCode],
                    ClusterName: [clusterName],
                    ClusterCode: [clusterCode],
                });
                bindMultipleEntities(multipleEnitiesArr);
            }
        } else {
            Swal.fire({
                title: "Duplicate entry found",
                icon: "warning",
                customClass: {
                    confirmButton: "btn button-base text-white me-1",
                },
                allowOutsideClick: false,
                buttonsStyling: false,
            });
        }
        $('#company').val('');
        $('#cluster').val('');
        populateProjects([], "project");
    }
});

function checkArr(data) {
    const existingProject = (data);
    let newProjectCode = [];
    if ($('input[name=Project]').val().includes(',')) {
        let inputString = $('input[name=Project]').val() == "" ? "" : $('input[name=Project]').val();
        let splitByComma = inputString.split(',');
        let lastValues = splitByComma.map(part => part.split('|').pop());
        newProjectCode = lastValues;
    } else {
        newProjectCode = $('input[name=Project]').val() == "" ? [] : [$('input[name=Project]').val().split('|')[1]];
    }
    let returnText2 = [];
    let returnText1 = [];
    returnText2 = getTextOfSelectedOptions("#project");
    const newProjectName = returnText2;
    const newCompanyCode = $("#company option:selected").val();
    const newCompanyName = $("#company option:selected").text();
    const newClusterCode = $('#cluster').val() == "" ? [] : [$('#cluster').val().split('|')[1]];
    const newClusterName = $('#cluster').val() == "" ? [] : [$('#cluster option:selected').text()];
    checkDuplicateEntitiesAdd.forEach(item => {
        let indexToRemove = newProjectCode.indexOf(item);
        while (indexToRemove !== -1) {
            newProjectCode.splice(indexToRemove, 1);
            newProjectName.splice(indexToRemove, 1);
            indexToRemove = newProjectCode.indexOf(item);
        }
    });
    addProject(existingProject, newProjectCode, newProjectName, newCompanyCode, newCompanyName, newClusterCode, newClusterName);

}

function addProject(existingProject, newProjectCode, newProjectName, newCompanyCode, newCompanyName, newClusterCode, newClusterName) {

    for (let i = 0; i < existingProject.length; i++) {
        if (existingProject[i].Company === newCompanyName) {
            if (JSON.stringify(existingProject[i].ClusterCode) == JSON.stringify([[]])) {
                const clusterIndex = existingProject[i].ClusterCode.findIndex(cluster => cluster.includes(newClusterCode.toString()));
                if (clusterIndex !== -1) {
                    existingProject[i].ProjectCode[clusterIndex] = [...existingProject[i].ProjectCode[clusterIndex], ...newProjectCode];
                    existingProject[i].ProjectName[clusterIndex] = [...existingProject[i].ProjectName[clusterIndex], ...newProjectName];
                } else {
                    JSON.stringify(existingProject[i].ProjectCode) == JSON.stringify([[]]) ? existingProject[i].ProjectCode = [newProjectCode] : existingProject[i].ProjectCode.push(newProjectCode);
                    JSON.stringify(existingProject[i].ProjectName) == JSON.stringify([[]]) ? existingProject[i].ProjectName = [newProjectName] : existingProject[i].ProjectName.push(newProjectName);
                    JSON.stringify(existingProject[i].ClusterCode) == JSON.stringify([[]]) ? existingProject[i].ClusterCode = [newClusterCode] : existingProject[i].ClusterCode.push(newClusterCode);
                    JSON.stringify(existingProject[i].ClusterName) == JSON.stringify([[]]) ? existingProject[i].ClusterName = [newClusterName] : existingProject[i].ClusterName.push(newClusterName);
                }
            } else {
                const clusterIndex = existingProject[i].ClusterCode.findIndex(cluster => cluster.includes(newClusterCode.toString()));
                if (clusterIndex !== -1) {
                    existingProject[i].ProjectCode[clusterIndex] = [...existingProject[i].ProjectCode[clusterIndex], ...newProjectCode];
                    existingProject[i].ProjectName[clusterIndex] = [...existingProject[i].ProjectName[clusterIndex], ...newProjectName];
                    if (JSON.stringify(existingProject[i].ProjectCode[clusterIndex]) == JSON.stringify([...existingProject[i].ProjectCode[clusterIndex], ...newProjectCode])) {
                        Swal.fire({
                            title: "Duplicate entry found",
                            icon: "warning",
                            customClass: {
                                confirmButton: "btn button-base text-white me-1",
                            },
                            allowOutsideClick: false,
                            buttonsStyling: false,
                        });
                    }
                } else {
                    existingProject[i].ProjectCode.push(newProjectCode);
                    existingProject[i].ProjectName.push(newProjectName);
                    existingProject[i].ClusterCode.push(newClusterCode);
                    existingProject[i].ClusterName.push(newClusterName);
                }
            }
        }
    }
    bindMultipleEntities(multipleEnitiesArr);
}
var data = [];
function bindMultipleEntities(data, flagstatus) {
    flagstatus = typeof flagstatus == "undefined" ? "" : flagstatus;
    if (flagstatus == "edit") {
        let companyData = [];
        for (let i = 0; i < data[0].Company.length; i++) {
            const companyObject = {
                Company: data[0].Company[i],
                CompanyCode: data[0].CompanyCode[i],
                ClusterCode: data[0].ClusterCode[i],
                ClusterName: data[0].ClusterName[i],
                Id: data[0].Id,
                ProjectCode: data[0].ProjectCode[i],
                ProjectName: data[0].ProjectName[i]
            };
            companyData.push(companyObject);
        }
        data = companyData;
        multipleEnitiesArr = data;
    }
    const totalProjectCountsArray = calculateProjectCodeCount(data);
    var html = '';

    if (data.length !== 0) {
        data.forEach((companyData, index) => {
            companyData.Id = index + 1;
            let totalProjects = 0;
            let totalCount = 0;
            totalProjects1 = companyData.ProjectName.reduce((count, array) => {
                return count + (array.length === 0 ? 1 : array.length);
            }, 0);
            totalCluster1 = companyData.ClusterName.reduce((sum, cluster) => sum + cluster.length, 0);
            if (totalCluster1 > totalProjects1) {
                totalProjects = totalCluster1
            } else {
                totalProjects = totalProjects1
            }
            totalCount = totalProjectCountsArray;

            let companyRowspan = 0;
            companyData.ClusterName.forEach((clusterNames, clusterIndex) => {
                let count = 0;
                let firstProject = '';
                let firstCluster = companyData.ClusterName[0];
                if (clusterIndex === 0) {
                    count = companyData.ProjectName[clusterIndex].length;
                    firstProject = companyData.ProjectName[clusterIndex][0];
                    firstProject = firstProject == undefined ? "" : firstProject;
                    html += `<tr>
                <td rowspan="${totalProjects === 0 ? 1 : totalProjects}">${companyData.Company}</td>
                <td rowspan='${count === 0 ? 1 : count}'>${firstCluster}</td>
                <td>${firstProject}</td>`
                    if (index == 0) {
                        html += `<td class="text-center td_${index}" rowspan='${totalCount === 0 ? 1 : totalCount}'>
                  <button type="button" onclick="deleteBtn(${companyData.Id})" id="deleterow" class="btn btn-icon btn-light-youtube m-1 me-2 btn-sm deleterow" tabindex="0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                  </button>
                </td>`
                    }
                    html += `</tr>`;
                }
                if (clusterIndex > 0) {
                    let otherCluster = clusterNames;
                    let rowspanLenght = 0;
                    if (totalCluster1 > totalProjects1) {
                        rowspanLenght = clusterNames.length;
                        html += `<tr>`
                        html += `<td rowspan="${rowspanLenght == 0 ? 1 : rowspanLenght}">${otherCluster}</td></tr>`
                    } else {
                        rowspanLenght = companyData.ProjectName[clusterIndex].length;
                        if (companyData.ProjectName[clusterIndex].length == 0) {
                            html += `<tr>`
                            html += `<td rowspan="${rowspanLenght == 0 ? 1 : rowspanLenght}">${otherCluster}</td></tr>`
                        } else {
                            companyData.ProjectName[clusterIndex].forEach((project, projectIndex) => {
                                html += `<tr>`
                                if (projectIndex == 0) {
                                    html += `<td rowspan="${rowspanLenght == 0 ? 1 : rowspanLenght}">${otherCluster}</td>`
                                }
                                html += `<td>${project}</td>`
                                html += `</tr>`;
                            });
                        }
                    }
                } else {
                    companyData.ProjectName[clusterIndex].forEach((project, projectIndex) => {
                        if (projectIndex > 0) {
                            html += `<tr>`
                            html += `<td>${project}</td>
                        </tr>`;
                        }
                    });
                }
            });
        });
    }
    $('#multiple_table').html(html);
    $("#cluster").html('<option value="">Select Cluster</option>');
}


function calculateProjectCodeCount(data) {
    let projectCounts = 0;
    data.forEach(record => {
        projectCounts += record.ProjectCode.reduce((count, array) => {
            return count + (array.length === 0 ? 1 : array.length);
        }, 0);
    });
    return projectCounts;
}


$("#clearTableData").on("click", function () {
    Swal.fire({
        title: "Are you sure you want to Clear Table Data?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "btn btn-sm btn-primary me-1",
            cancelButton: "btn btn-sm ",
        },
        allowOutsideClick: false,
        buttonsStyling: false,
    }).then(function (result) {
        if (result.value) {
            multipleEnitiesArr.length = 0;
            if ($("#AddDataModalLabel").hasClass("d-none")) {
                if (mileageClaimsArray.length !== 0) {
                    if (multipleEnitiesArr.length == 0) {
                        index = hdautoId - 1
                        mileageClaimsArray[index].CompanyName = ""
                        mileageClaimsArray[index].CompanyCode = ""
                        mileageClaimsArray[index].ClusterCode = []
                        mileageClaimsArray[index].ClusterName = []
                        mileageClaimsArray[index].ProjectCode = []
                        mileageClaimsArray[index].ProjectName = []
                    }
                }
            }
            $("#entitiesDiv").addClass("d-none");
        }
    });
});

function deleteBtn(id) {
    Swal.fire({
        title: "Are you sure you want to delete?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "btn btn-sm btn-primary me-1",
            cancelButton: "btn btn-sm ",
        },
        allowOutsideClick: false,
        buttonsStyling: false,
    }).then(function (result) {
        if (result.value) {
            multipleEnitiesArr.length = 0;
            if ($("#AddDataModalLabel").hasClass("d-none")) {
                if (mileageClaimsArray.length !== 0) {
                    if (multipleEnitiesArr.length == 0) {
                        index = hdautoId - 1
                        mileageClaimsArray[index].CompanyName = ""
                        mileageClaimsArray[index].CompanyCode = ""
                        mileageClaimsArray[index].ClusterCode = []
                        mileageClaimsArray[index].ClusterName = []
                        mileageClaimsArray[index].ProjectCode = []
                        mileageClaimsArray[index].ProjectName = []
                    }
                }
            }
            if (multipleEnitiesArr.length == 0) {
                $('#entitiesDiv').addClass('d-none');
            }
            bindMultipleEntities(multipleEnitiesArr);
            Swal.fire({
                title: "Deleted Succesfully",
                icon: "success",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary me-1",
                },
                allowOutsideClick: false,
                buttonsStyling: false,
            });
        }
    });
}

const populateCluster = (data, dropdownId) => {
    if (data != null && data != undefined) {
        $(`#${dropdownId}`).empty();
        $(`#${dropdownId}`).append('<option value="">Select Cluster</option>');
        let sortedListEntities = [];
        sortedListEntities = data
            .map((element, key) => {
                element.label = element.ClusterName;
                element.value = element.ClusterCode;
                let { label, value } = element;
                return { label, value };
            })
            .sort((a, b) => {
                if (a.label < b.label) {
                    return -1;
                } else if (a.label > b.label) {
                    return 1;
                } else {
                    return 0;
                }
            });
        cluster.destroy();
        $("#cluster").empty();
        test_VirtualSelect(dropdownId, sortedListEntities, 'Cluster');
        $('.vscomp-toggle-button').addClass('form-select');
    }
};

const populateProjects = (data, dropdownId) => {
    if (data != null && data != undefined) {
        $(`#${dropdownId}`).empty();
        $(`#${dropdownId}`).append('<option value="">Select Projects</option>');
        let sortedListEntities = [];
        sortedListEntities = data
            .map((element, key) => {
                element.label = element.ProjectName;
                element.value = element.ProjectCode;
                let { label, value } = element;
                return { label, value };
            })
            .sort((a, b) => {
                if (a.label < b.label) {
                    return -1;
                } else if (a.label > b.label) {
                    return 1;
                } else {
                    return 0;
                }
            });
        project.destroy();
        $("#project").empty();
        test_VirtualSelect(dropdownId, sortedListEntities, 'Project');
        $('.vscomp-toggle-button').addClass('form-select');
    }
};

function test_VirtualSelect(elementId, options, value) {
    VirtualSelect.init({
        ele: `#${elementId}`,
        options,
        placeholder: `Select ${value}`
    });

    $(`#${elementId} .vscomp-search-input`).on("input", function () {
        if ($(`#${elementId} .vscomp-search-input`).val() == "") {
            $(`#${elementId} .vscomp-toggle-all-button`).removeClass("d-none");
        } else {
            $(`#${elementId} .vscomp-toggle-all-button`).addClass("d-none");
        }
    });
    $(".vscomp-search-clear").on("click", function () {
        if ($(".vscomp-search-input").val() == "") {
            $(".vscomp-toggle-all-button").removeClass("d-none");
        } else {
            $(".vscomp-toggle-all-button").addClass("d-none");
        }
    });
}

function getTextOfSelectedOptions(id) {
    var myvirtualselect = VirtualSelect.init({
        ele: id,
    });

    var selectedValues = myvirtualselect.selectedValues;

    var selectedOptionsText = [];
    for (var i = 0; i < selectedValues.length; i++) {
        var selectedValue = selectedValues[i];
        var option = myvirtualselect.options.find(function (option) {
            return option.value === selectedValue;
        });
        if (option) {
            selectedOptionsText.push(option.label);
        }
    }
    return selectedOptionsText;
}



let projectData = [];
function bindCluster(company, clusterCode, ExpenseId) {
    ExpenseId = typeof ExpenseId == "undefined" ? "defaultValue" : ExpenseId;
    projectData.length = 0;
    let companyCode;
    if (company == undefined) {
        companyCode = $("#company option:selected").val();
    } else {
        companyCode = company;
    }
    if (companyCode != "") {
        let filteredData = projects.filter((x) => x.CompanyCode == companyCode);
        clusterData = filteredData[0].Clusters;
        if (clusterData.length != 0) {
            $("#cluster").empty();
            var html = "";
            html += `<option value="">Select Cluster</option>`
            for (let i = 0; i < clusterData.length; i++) {
                let project_array = clusterData[i].Projects;
                html += `<option value="${clusterData[i].ClusterCode}">${clusterData[i].ClusterName}</option>`
                for (let j = 0; j < project_array.length; j++) {
                    projectData.push(clusterData[i].Projects[j]);
                }
            }
            $("#cluster").html(html);
        } else {
            projectData.length = 0;
            if ($('#toggleBtn').is(":checked", true)) {
                VirtualSelect.init({
                    ele: ".multiSelectCheckbox",
                });
                $('.multiSelectCheckbox').addClass('p-0');
                $("#cluster").html(`<option value="">Select Cluster</option>`);
                populateProjects([], "project");
                $('#cluster').attr('onchange', 'bindProject()');
            } else {
                $("#cluster").html(`<option value="">Select Cluster</option>`);
                $("#project").html(`<option value="">Select Project</option>`);
            }
        }
    } else {
        projectData.length = 0;
        if ($('#toggleBtn').is(":checked", true)) {
            VirtualSelect.init({
                ele: ".multiSelectCheckbox",
            });
            $('.multiSelectCheckbox').addClass('p-0');
            $("#cluster").html(`<option value="">Select Cluster</option>`);
            populateProjects([], "project");
            $('#cluster').attr('onchange', 'bindProject()');
        } else {
            $("#cluster").html(`<option value="">Select Cluster</option>`);
            $("#project").html(`<option value="">Select Project</option>`);
        }
    }
}

function bindProject(cluster) {
    let clustercode = [];
    if (cluster == undefined) {
        let inputString = $("#cluster option:selected").val();
        let splitByComma = inputString.split(',');
        let lastValues = splitByComma.map(part => part.split('|').pop());
        clustercode = lastValues;
    } else {
        clustercode.push(cluster);
    }
    if (clustercode.length != 0) {
        for (var i = 0; i < clustercode.length; i++) {
            let filteredProject = projectData.filter((x) => x.ProjectCode.split("|")[0] == clustercode);
            if (filteredProject.length !== 0) {
                if ($('#toggleBtn').is(":checked", true)) {
                    VirtualSelect.init({
                        ele: ".multiSelectCheckbox",
                    });
                    $('.multiSelectCheckbox').addClass('p-0')
                    populateProjects(filteredProject, "project");

                } else {
                    $("#project").empty();
                    var html = "";
                    html += `<option value="">Select Project</option>`
                    for (let i = 0; i < filteredProject.length; i++) {
                        html += `<option value="${filteredProject[i].ProjectCode}">${filteredProject[i].ProjectName}</option>`
                    }
                    $("#project").html(html);
                }
            } else {
                if ($('#toggleBtn').is(":checked", true)) {
                    VirtualSelect.init({
                        ele: ".multiSelectCheckbox",
                    });
                    $('.multiSelectCheckbox').addClass('p-0')
                    populateProjects([], "project");

                } else {
                    var html1 = `<option value="">Select Project</option>`
                    $("#project").html(html1);
                }
            }
        }
    } else {
        if ($('#toggleBtn').is(":checked", true)) {
            VirtualSelect.init({
                ele: ".multiSelectCheckbox",
            });
            $('.multiSelectCheckbox').addClass('p-0')
            populateProjects([], "project");

        } else {
            var html1 = `<option value="">Select Project</option>`
            $("#project").html(html1);
        }
    }
}


function backbtn(status) {
    if ($("#AddDataModalLabel").hasClass("d-none")) {
        if (mileageClaimsArray[hdautoId - 1].EntitiesStatus) {
            if ($('#toggleBtn').is(":checked", true)) {
                if (multipleEnitiesArr.length !== 0) {
                    if (mileageClaimsArray[hdautoId - 1].CompanyCode == "") {
                        BackAlert();
                    } else {
                        handleChanges(status);
                    }
                } else {
                    BackAlert();
                }
            } else {
                if ($("#company").val() == "") {
                    BackAlert();
                } else {
                    BackAlert();
                }
            }
        } else {
            if ($('#toggleBtn').is(":checked", true)) {
                if ($("#company").val() == "") {
                    BackAlert();
                } else {
                    BackAlert();
                }
            } else {
                if ($("#company").val() == "") {
                    handleChanges(status);
                } else {
                    handleChanges(status);
                }
            }
        }
    } else {
        handleChanges(status)
    }
}

function handleChanges(status) {
    if (
        status == "page"
            ? somethingChanged == true
            : somethingChangedForModel == true
    ) {
        Swal.fire({
            title: "All your changes will be lost !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Continue",
            customClass: {
                confirmButton: "btn button-base text-white me-1",
                cancelButton: "btn button-base-white",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        }).then(function (result) {
            if (somethingChangedForModel == false) {
                if (result.value) {
                    location.href = Host_URL + "/Mileages";
                }
            } else {
                if (result.value) {
                    somethingChangedForModel = false;
                    $("#AddDataModal").modal("hide");
                }
            }
            mileageRate = null;
        });
        $(".btn-primary").focus();
    } else {
        if (status == "page") {
            location.href = Host_URL + "/Mileages";
        } else {
            $("#AddDataModal").modal("hide");
            mileageRate = null;
        }
    }
}


function BackAlert() {
    Swal.fire({
        title: "Are you sure selected expense details will be lost if you continue?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "btn btn-sm btn-primary me-1",
            cancelButton: "btn btn-sm ",
        },
        allowOutsideClick: false,
        buttonsStyling: false,
    }).then(function (result) {
        if (result.value) {
            mileageClaimsArray = $.grep(mileageClaimsArray, function (element, index) {
                return element.srno != hdautoId
            });
            expenseTable();
            $('#AddDataModal').modal('hide');
        }
    })
}


//   ActualMileid

$("#mileage").on("input", function () {
    const milesValue = $(this).val();
    const finalAmount = (mileageRate * milesValue);
    $('#actualMileidAmount').html(finalAmount.toFixed(2));
})

$("#ActualMile").on("input", function () {
    const milesValue = $(this).val();
    const finalAmount = (mileageRate * milesValue);
    $('#actualMileidAmount').html(finalAmount.toFixed(2));
});


function addHoverInfoSpans(form) {

    const labels = form.querySelectorAll('label[for]');
    const hoverPromptNames = HoverPrompts.map(prompt => prompt.HoverPromptName);

    labels.forEach(label => {

        let labelFor = "";
        if (label.getAttribute('for').split('_').length > 1) {
            labelFor = label.getAttribute('for').split('_')[1];
        } else {
            labelFor = label.getAttribute('for').split('_')[0];
        }
        const matchingPrompt = HoverPrompts.find(prompt => prompt.HoverPromptName === labelFor);

        if (hoverPromptNames.includes(labelFor)) {
            const span = document.createElement('span');
            span.title = matchingPrompt.HoverPromptDesc;
            span.className = 'position-absolute ps-2';
            span.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#bdbfc6" class="bi bi-info-circle-fill mb-1" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                </svg>
            `;
            label.insertAdjacentElement('afterend', span);
        }
    });
}

function AmountSeprator(number, status, index) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (status == true) {
        amountArray[index] = parts.join(".");
    } else {
        amountArray.push(parts.join("."));
    }
    addamount = parts.join(".");
}

document.getElementById('formProcess').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
    }
});

$('.mapLocation').on('change', function () {
    const startPoint = $("#fromTbx").val();
    const endPoint = $("#toTbx").val();
    if (startPoint == "" && endPoint == "") {
        $("#computedMileage").html('');
        $("#output").html('');
    }
})

function zeronotAllow() {
    if ($("#mileage").val().match(/^0/)) {
        $("#mileage").val("");
        return false;
    }

    if ($("#ActualMile").val().match(/^0/)) {
        $("#ActualMile").val("");
        return false;

    }
}

$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    if (!IsEditModel) {
        const activeTab = $(e.target).data('tab');
        if (activeTab === 'mileage') {
            validator2.resetField('MapFrom', true);
            validator2.resetField('MapTo', true);
            validator2.resetField('Mileage', true);
        } else if (activeTab === 'map') {
            validator2.resetField('StartLocation', true);
            validator2.resetField('EndLocation', true);
            validator2.resetField('ActualMile', true);
        }
    }
});


$(".Approver").on("change", (event) => {
    if (
        $("#Approver1Id option:selected").text() ==
        $("#Approver2Id option:selected").text()
    ) {
        Swal.fire({
            title: "Approver1 and Approver2 can't be same.",
            icon: "warning",
            customClass: {
                confirmButton: "btn button-base text-white me-1",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        });
        $(`#${event.target.id}`).val("");
    }
});


let clickStatus = true;
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tabClick');
    const panes = document.querySelectorAll('.tab-pane');
    let currentTabId = 'kt_tab_pane_1'; // Default active tab initially

    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            if ($("#AddDataModalLabel").hasClass("d-none")) {
                if (clickStatus) {
                    activeTab = mileageClaimsArray[hdautoId - 1].IsMapsEntry == true ? "map" : "mileage";
                }
                const newTabId = this.getAttribute('data-tab');
                if (activeTab !== newTabId && somethingChangedForModelTab == true) {
                    Swal.fire({
                        title: "Are you sure? Data will be lost!",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "OK",
                        customClass: {
                            confirmButton: "btn btn-sm btn-primary me-1",
                            cancelButton: "btn btn-sm ",
                        },
                        allowOutsideClick: false,
                        buttonsStyling: false,
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            if (newTabId === 'mileage') {
                                validator2.resetField('MapFrom', true);
                                validator2.resetField('MapTo', true);
                                validator2.resetField('Mileage', true);
                                validator2.resetField('StartLocation', true);
                                validator2.resetField('EndLocation', true);
                                validator2.resetField('ActualMile', true);
                                $("#output").html('');
                                $("#computedMileage").html('');
                                $("#actualMileidAmount").html('');
                                document.getElementById("mileshide").classList.add("d-none");
                                somethingChangedForModelTab = false;
                            } else if (newTabId === 'map') {
                                validator2.resetField('StartLocation', true);
                                validator2.resetField('EndLocation', true);
                                validator2.resetField('ActualMile', true);
                                validator2.resetField('MapFrom', true);
                                validator2.resetField('MapTo', true);
                                validator2.resetField('Mileage', true);
                                $("#actualMileidAmount").html('');
                                somethingChangedForModelTab = false;
                            }
                            clickStatus = false;
                            activeTab = activeTab == "map" ? "mileage" : "map";
                        } else {
                            if (newTabId === 'mileage') {
                                $('a[data-bs-toggle="tab"][href="#kt_tab_pane_2"]').tab('show');
                            } else {
                                $('a[data-bs-toggle="tab"][href="#kt_tab_pane_1"]').tab('show');
                            }
                        }
                    });
                }
            }
            else {
                validator2.resetField('MapFrom', true);
                validator2.resetField('MapTo', true);
                validator2.resetField('Mileage', true);
                validator2.resetField('StartLocation', true);
                validator2.resetField('EndLocation', true);
                validator2.resetField('ActualMile', true);
                $("#output").html('');
                $("#computedMileage").html('');
                $("#actualMileidAmount").html('');
                document.getElementById("mileshide").classList.add("d-none");
            }
        });
    });
});



function dispalyImage(imageFile, key) {
    const file = imageFile;
    const preview = document.getElementById(`preview_${key}`);
    let downloadImgurl = document.getElementById(`download_${key}`);
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.style.backgroundImage = `url('${e.target.result}')`;
            $(downloadImgurl).attr('href', `${e.target.result}`)
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
    }
}


function append(url, key) {
    if (url == key) {
        const preview = document.getElementById(`preview_${key}`);
        const downloadImg = document.getElementById(`download_${key}`);
        const backgroundImage = window.getComputedStyle(preview).getPropertyValue('background-image');
        const urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        const previewUrl = urlMatch ? urlMatch[1] : null;
        url = previewUrl;
        $(downloadImg).attr('href', `${url}`)
    }
    var lightbox = new FsLightbox();
    var currentValue = url;
    lightbox.props.sources = [currentValue];
    lightbox.open();
}

$("#btnClear").click(function () {
    if (mileageClaimsArray.length != 0) {
        Swal.fire({
            title: "Are you sure you want to clear table?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: "btn button-base text-white me-1",
                cancelButton: "btn button-base-white",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        }).then(function (result) {
            if (result.value) {
                $("#FromDate").removeClass("pe-none");
                $("#todate").removeClass("pe-none");
                $(".headerDate").attr("tabindex", "0");

                mileageClaimsArray.length = 0;
                //   totalImageArray.length = 0;
                //   returnAttachment.length = 0;
                mileageClaimsTable();
                if (mileageClaimsArray.length == 0) {
                    // $("#UploadAll").addClass("disabled");
                    $("#btnClear").addClass("disabled");
                    // $("#UploadAll").attr("tabindex", "-1");
                    $("#btnClear").attr("tabindex", "-1");
                }

            }
        });
    } else {
        Swal.fire({
            title: "No data available in table",
            icon: "warning",
            customClass: {
                confirmButton: "btn button-base text-white me-1",
            },
            allowOutsideClick: false,
            buttonsStyling: false,
        });
    }
});

const recalculateAmount = () => {
    if ($('.nav-link.active').data("tab") == "mileage") {
        if ($("#mileage").val() !== "") {
            $("#mileage").trigger("input");
        }
    } else if ($('.nav-link.active').data("tab") == "map") {
        if ($("#ActualMile").val() !== "") {
            $("#ActualMile").trigger("input");
        }
    }
}